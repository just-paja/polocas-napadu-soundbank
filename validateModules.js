const glob = require('glob');

const { validateModule } = require('./schema');

glob('./**/*.json', (err, files) => {
  let errors = 0;
  let tags = [];
  if (err) {
    throw new Error(err);
  }
  files.forEach((file) => {
    const fileContent = require(file);
    const validationResult = validateModule(fileContent);
    if (validationResult.errors.length) {
      validationResult.errors.forEach(validationError => {
        console.error(`${file}: ${validationError.stack}`, validationResult.instance);
      });
      errors += 1;
    } else {
      if (fileContent.tags) {
        tags = tags
          .concat(fileContent.tags)
          .filter((tag, index, self) => self.findIndex(tagB => tagB.name === tag.name) === index);
      }
    }
  });
  files.forEach((file) => {
    const { baseTag, sounds } = require(file);
    if (baseTag) {
      if (!tags.find(tag => tag.name === baseTag)) {
        console.error(`Missing baseTag definition for ${tagName} in module ${file}`);
        errors += 1;
      }
    }
    if (sounds) {
      sounds.forEach((sound) => {
        if (sound.tags) {
          sound.tags.forEach((tagName) => {
            if (!tags.find(tag => tag.name === tagName)) {
              console.error(`Missing tag definition for ${tagName} on sound ${sound.file} in module ${file}`);
              errors += 1;
            }
          });
        }
      });
    }
  });
  if (errors) {
    throw new Error(`Failed to validate. Found ${errors} errors.`);
  }
});
