'use strict'
/**
 * Lifetime Management
 * https://github.com/jeffijoe/awilix#lifetime-management
 */
const awilix = require('awilix');

const i18n = require('./i18n.config');
const LocaleService = require('./app/services/locale-service');
 
const container = awilix.createContainer();
 
container
  .register({
    localeService: awilix.asClass(LocaleService, { lifetime: awilix.Lifetime.SINGLETON })
  })
  .register({
    i18nProvider: awilix.asValue(i18n)
  });
 
module.exports = container;