'use strict';
const moduleLoader = require('serviser').moduleLoader;
const service      = require('./index.js');

module.exports = service.appManager;

let app = service.buildMQApp('rabbit');

moduleLoader.loadModules([
    __dirname + '/routes',
], {
    except: []
});
