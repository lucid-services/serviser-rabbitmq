
module.exports = {
    //amqp://username:password@host:port/vhost
    amqp: {
        type: 'object',
        required: ['host'],
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
            }
        }
    }
};
