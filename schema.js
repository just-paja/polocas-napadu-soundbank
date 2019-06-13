const { Validator } = require('jsonschema')

const ObjectTitle = {
  'id': '/ObjectTitle',
  'type': 'object',
  'patternProperties': {
    '^[a-z]{2}(-[a-z]{2})?$': {
      'type': 'string'
    }
  }
}

const Sound = {
  'id': '/Sound',
  'type': 'object',
  'properties': {
    'file': {
      'type': 'string'
    },
    'title': {
      '$ref': '/ObjectTitle'
    },
    'tags': {
      'type': 'array',
      'items': {
        'type': 'string'
      }
    }
  },
  'required': ['file']
}

const SoundTag = {
  'id': '/SoundTag',
  'type': 'object',
  'properties': {
    'name': {
      'type': 'string'
    },
    'title': {
      '$ref': '/ObjectTitle'
    }
  }
}

const SoundModule = {
  'id': '/SoundModule',
  'type': 'object',
  'properties': {
    'name': {
      'type': 'string'
    },
    'title': {
      '$ref': '/ObjectTitle'
    },
    'baseTag': {
      'type': 'string'
    },
    'modules': {
      'type': 'array',
      'items': {
        'type': 'string'
      }
    },
    'sounds': {
      'type': 'array',
      'items': {
        '$ref': '/Sound'
      }
    },
    'tags': {
      'type': 'array',
      'items': {
        '$ref': '/SoundTag'
      }
    }
  },
  'required': ['name']
}

const validateModule = (module) => {
  const validator = new Validator();
  validator.addSchema(ObjectTitle, '/ObjectTitle');
  validator.addSchema(Sound, '/Sound');
  validator.addSchema(SoundTag, '/SoundTag');
  validator.addSchema(SoundModule, '/SoundModule');
  return validator.validate(module, SoundModule);
};

module.exports = {
  ObjectTitle,
  Sound,
  SoundTag,
  SoundModule,
  validateModule
}
