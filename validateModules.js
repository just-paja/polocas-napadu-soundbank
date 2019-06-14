const fs = require('fs')
const glob = require('glob')
const path = require('path')

const { validateModule } = require('./schema')

const skipFileCheck = process.argv.indexOf('--fileCheck') === -1

let errors = 0

const modules = glob.sync(path.join('.', '**', '*.json'))
  .filter(file => file && !file.match(/node_modules/))
  .map(file => ({
    file,
    manifestPath: path.resolve(__dirname, file),
    modulePath: path.resolve(__dirname, file, '..'),
    manifest: require(path.resolve(__dirname, file))
  }))

// Check module schema
modules.forEach(({ file, manifest }) => {
  const validationResult = validateModule(manifest)

  if (validationResult.errors.length) {
    validationResult.errors.forEach(validationError => {
      console.error(`${file}: ${validationError.stack}`, validationResult.instance)
    })
    errors += 1
  }
})

// Load all tags
const tags = modules
  .filter(({ manifest }) => manifest.tags)
  .map(({ manifest }) => manifest.tags)
  .reduce(
    (aggr, moduleTags) => aggr
      .concat(moduleTags)
      .filter((tag, index, self) => self.findIndex(tagB => tagB.name === tag.name) === index),
    []
  )

// Check sound files existence
modules
  .filter(manifest => !skipFileCheck && manifest.sounds)
  .forEach(({ file, manifest, modulePath }) => {
    manifest.sounds.forEach((sound) => {
      const soundPath = path.resolve(modulePath, sound)
      if (!fs.existsSync(soundPath)) {
        console.error(`${file}: File not found: ${sound}`)
        errors += 1
      }
      try {
        const stats = fs.statSync(soundPath)
        if (stats.size === 0) {
          console.error(`${file}: ${soundPath} is zero size.`)
          errors += 1
        }
      } catch (e) {
        console.error(e.message)
        errors += 1
      }
    })

    glob.sync(`${modulePath}/*.mp3`).forEach((soundFile) => {
      const referenced = manifest.sounds.some(
        sound => path.resolve(modulePath, sound) === soundFile
      )
      if (!referenced) {
        console.error(`${file}: Sound file is not referenced: ${soundFile}`)
      }
    })
  })

// Check base tag
modules.forEach(({ file, manifest }) => {
  if (manifest.baseTag) {
    if (!tags.find(tag => tag.name === manifest.baseTag)) {
      console.error(`Missing baseTag definition for ${manifest.baseTag} in module ${file}`)
      errors += 1
    }
  }
})

if (errors) {
  console.error(`Failed to validate. Found ${errors} errors.`)
  process.exit(1)
}
