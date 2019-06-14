const fs = require('fs')
const glob = require('glob')
const path = require('path')
const deepEqual = require('deep-equal')

const saveJson = (path, data) => {
  const fd = fs.openSync(path, 'w')
  fs.writeSync(fd, JSON.stringify(data, null, 2))
  fs.closeSync(fd)
}

const filterIgnoredFiles = dir => !dir.match(/(node_modules|^\.)/)
const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source => fs
  .readdirSync(source)
  .map(name => path.join(source, name))
  .filter(isDirectory)
  .filter(filterIgnoredFiles)

const getDirectoriesDeep = source => getDirectories(source)
  .filter(filterIgnoredFiles)
  .reduce(
    (aggr, dir) => [
      ...aggr,
      path.join(dir),
      ...getDirectoriesDeep(dir)
    ],
    []
  )

const getManifest = (dir, manifestPath) => {
  try {
    return {
      exists: true,
      manifest: require(manifestPath)
    }
  } catch (e) {
    return {
      exists: false,
      manifest: {
        name: dir
      }
    }
  }
}

const sanitizeName = fileName => fileName
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[\s_\-()]+/g, '-')
  .replace(/[,]/g, '')
  .replace(/^-/g, '')

function regenerateModule ({ dirName, manifestPath, modulePath }) {
  const { exists, manifest } = getManifest(dirName, manifestPath)
  const sounds = glob.sync(path.join(modulePath, '*.mp3'))
    .map(file => path.basename(file))
    .map((file) => {
      const soundNameSanitized = sanitizeName(file)
      const soundPath = path.join(modulePath, file)
      const soundPathSanitized = path.join(modulePath, soundNameSanitized)
      if (soundPath !== soundPathSanitized) {
        process.stderr.write(`Renaming "${file}" to "${soundNameSanitized}"\n`)
        fs.renameSync(soundPath, soundPathSanitized)
      }
      return soundNameSanitized
    })
  const modules = getDirectories(modulePath).map(module => path.basename(module))
  const nextManifest = {
    ...manifest,
    modules,
    sounds
  }

  if (!exists || !deepEqual(manifest, nextManifest)) {
    process.stderr.write(`Regenerating ${dirName}\n`)
    saveJson(manifestPath, nextManifest)
  }
}

getDirectoriesDeep('.')
  .filter(dir => !dir.match(/(node_modules|^\.)/))
  .map(dirName => ({
    dirName,
    manifestPath: path.resolve(__dirname, dirName, 'manifest.json'),
    modulePath: path.resolve(__dirname, dirName)
  }))
  .forEach(regenerateModule)

regenerateModule({
  dirName: 'root',
  manifestPath: './index.json',
  modulePath: '.'
})
