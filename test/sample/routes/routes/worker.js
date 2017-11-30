'use strict'

const sinon  = require('sinon');
const router = require('../router.js');

const route = router.buildRoute({
    type: 'worker',
    url : 'worker',
    summary: 'Testing worker route',
    amqp: {}
});

route.main(sinon.spy(function(req) {
    req.ack();
}));
