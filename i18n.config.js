const i18n = require('i18n');
const path = require('path');
 
i18n.configure({
  locales: ['en', 'el'],
  defaultLocale: 'en',
  objectNotation: true,
  queryParameter: 'lang',
  directory: path.join('./', 'locales'),
  api: {
    '__': 'translate',  
    '__n': 'translateN' 
  },
});
 
module.exports = i18n;