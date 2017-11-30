'use strict'

const router = require('../router.js');

const route = router.buildRoute({
    type: 'reply',
    url : 'reply',
    summary: 'reply',
    amqp: {}
});

route.main(function(req, res) {
    res.json(req.body);
});
