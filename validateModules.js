const fs = require('fs')
const glob = require('glob')
const path = require('path')

const { validateModule } = require('./schema')

const skipFileCheck = process.argv.indexOf('--fileCheck') === -1

let errors = 0

glob('./**/*.json', (err, files) => {
  let tags = []
  if (err) {
    throw new Error(err)
  }
  files = files.filter(file => !file.match(/node_modules/))
  // validate schema
  files.forEach((file) => {
    const fileContent = require(file)
    const modulePath = path.resolve(file, '..')
    const validationResult = validateModule(fileContent)
    if (validationResult.errors.length) {
      validationResult.errors.forEach(validationError => {
        console.error(`${file}: ${validationError.stack}`, validationResult.instance)
      })
      errors += 1
    } else {
      if (fileContent.tags) {
        tags = tags
          .concat(fileContent.tags)
          .filter((tag, index, self) => self.findIndex(tagB => tagB.name === tag.name) === index)
      }
    }

    if (fileContent.sounds) {
      fileContent.sounds.forEach((sound) => {
        const soundPath = path.resolve(modulePath, sound.file)
        if (!fs.existsSync(soundPath)) {
          console.error(`${file}: File not found: ${sound.file}`)
          errors += 1
        }
      })
    }

    glob.sync(`${modulePath}/*.mp3`).forEach((soundFile) => {
      const referenced = fileContent.sounds.some((sound) => {
        const soundPath = path.resolve(modulePath, sound.file)
        return soundPath === soundFile
      })
      if (!referenced) {
        console.error(`${file}: Sound file is not referenced: ${soundFile}`)
      }
    })
  })

  // validate module contents
  files.forEach((file) => {
    const { baseTag, sounds } = require(file)
    if (baseTag) {
      if (!tags.find(tag => tag.name === baseTag)) {
        console.error(`Missing baseTag definition for ${baseTag} in module ${file}`)
        errors += 1
      }
    }
    if (sounds) {
      sounds.forEach((sound) => {
        if (sound.tags) {
          sound.tags.forEach((tagName) => {
            if (!tags.find(tag => tag.name === tagName)) {
              console.error(`Missing tag definition for ${tagName} on sound ${sound.file} in module ${file}`)
              errors += 1
            }
          })
          if (!skipFileCheck) {
            const filePath = path.join(path.dirname(file), sound.file)
            try {
              const stats = fs.statSync(filePath)
              if (stats.size === 0) {
                console.error(`${filePath} is zero size.`)
                errors += 1
              }
            } catch (e) {
              console.error(e.message)
              errors += 1
            }
          }
        }
      })
      if (sounds.length && !skipFileCheck) {
        const soundFiles = glob.sync(path.join(path.dirname(file), '*'))
        soundFiles
          .filter(soundFile => soundFile.indexOf('json') === -1)
          .forEach((soundFile) => {
            if (!sounds.find(sound => sound.file === path.basename(soundFile))) {
              console.error(`File ${soundFile} is unreferenced`)
              errors += 1
            }
          })
      }
    }
  })

  if (errors) {
    console.error(`Failed to validate. Found ${errors} errors.`)
    process.exit(1)
  }
})
