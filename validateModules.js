const glob = require('glob');

const { validateModule } = require('./schema');

glob('./*.json', (err, files) => {
  let errors = 0;
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
    }
  });
  if (errors) {
    throw new Error('Failed to validate');
  }
});
