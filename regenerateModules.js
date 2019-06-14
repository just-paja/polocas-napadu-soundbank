const fs = require('fs')
const glob = require('glob')
const path = require('path')
const deepEqual = require('deep-equal')

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source =>
  fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

const getDirectoriesDeep = source => getDirectories(source)
  .filter(dir => !dir.match(/(node_modules|^\.)/))
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

const sanitizeName = (fileName) =>
  fileName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_\-()]+/g, '-')
    .replace(/[,]/g, '')
    .replace(/^-/g, '')

getDirectoriesDeep('.')
  .filter(dir => !dir.match(/(node_modules|^\.)/))
  .map(dirName => ({
    dirName,
    manifestPath: path.resolve(__dirname, dirName, 'manifest.json'),
    modulePath: path.resolve(__dirname, dirName)
  }))
  .forEach(({ dirName, manifestPath, modulePath }) => {
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
    const modules = getDirectories(modulePath)
    const nextManifest = {
      ...manifest,
      modules,
      sounds
    }

    // console.log(manifest, nextManifest)

    if (!exists || !deepEqual(manifest.sounds, sounds)) {
      process.stderr.write(`Regenerating ${dirName}\n`)
      const fd = fs.openSync(manifestPath, 'w')
      fs.writeSync(fd, JSON.stringify(nextManifest, null, 2))
      fs.closeSync(fd)
    }
  })
