'use strict'

const sinon  = require('sinon');
const router = require('../router.js');

const route = router.buildRoute({
    type: 'subscribe',
    url : 'subscribe',
    summary: 'Testing subscribe route',
    amqp: {}
});

route.main(sinon.spy());
