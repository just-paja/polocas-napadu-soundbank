const fs = require('fs')
const glob = require('glob')
const path = require('path')

function areArraysEqual (arr1, arr2) {
  return (
    arr1 &&
    arr2 &&
    arr1.length === arr2.length &&
    arr1.every((u, i) => u === arr2[i])
  )
}

glob
  .sync(path.join('.', '**', '*.json'))
  .filter(file => !file.match(/node_modules/))
  .forEach((file) => {
    const manifestPath = path.resolve(__dirname, file)
    const modulePath = path.resolve(__dirname, file, '..')
    const manifest = require(manifestPath)
    const sounds = glob.sync(path.join(modulePath, '*.mp3')).map(file => path.basename(file))

    if (!areArraysEqual(manifest.sounds, sounds)) {
      process.stderr.write(`Regenerating ${file}\n`)
      const nextManifest = {
        ...manifest,
        sounds
      }
      const fd = fs.openSync(manifestPath, 'w')
      fs.writeSync(fd, JSON.stringify(nextManifest, null, 2))
      fs.closeSync(fd)
    }
  })
