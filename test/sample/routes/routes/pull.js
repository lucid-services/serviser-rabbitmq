'use strict'

const sinon  = require('sinon');
const router = require('../router.js');

const route = router.buildRoute({
    type: 'pull',
    url : 'pull',
    summary: 'Testing pull route',
    amqp: {}
});

route.validate({
    type: 'object',
    additionalProperties: false,
    properties: {
        username: {type: 'string', $desc: 'description'},
        email: {
            type: 'string',
            format: 'email',
            $desc: 'description'
        },
    }
}, 'body');

route.main(sinon.spy());
