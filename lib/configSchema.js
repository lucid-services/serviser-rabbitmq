
module.exports = {
    //amqp://username:password@host:port/vhost
    amqp: {
        type: 'object',
        required: ['host'],
        additionalProperties: true,
        properties: {
            username: {
                type: 'string'
            },
            password: {
                type: 'string'
            },
            host: {
                type: 'string',
                default: '127.0.0.1'
            },
            port: {
                type: ['string', 'integer'],
                default: 5672
            },
            vhost: {
                type: ['string', 'null']
            },
            ssl: {
                type: 'boolean',
                default: false
            },
            frameMax: {
                type: 'integer'
            },
            channelMax: {
                type: 'integer'
            },
            heartbeat: {
                type: 'integer'
            }
        }
    }
};
