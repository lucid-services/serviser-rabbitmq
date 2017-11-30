'use strict';
const url     = require('url');
const config  = require('bi-config');
const Service = require('bi-service').Service;

const AMQP_PARAMS = process.env.AMQP_PARAMS || '';
const params = url.parse(AMQP_PARAMS);

const service = module.exports = new Service(config);
config.set('apps:rabbit', {
    amqp: {
        ssl: params.protocol === 'amqps:' ? true : false,
        vhost: (params.pathname || '').slice(1),
        port: params.port,
        host: params.hostname,
        password: (params.auth || '').split(':').pop(),
        username: (params.auth || '').split(':').shift(),
    }
});

service.on('set-up', function() {
    require('./app.js');
});

require('../../index.js');
