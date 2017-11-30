const Service = require('bi-service');
const service = require('../sample/index.js');

describe('RABBITMQ', function() {

    before(function() {
        return service.listen();
    });

    after(function() {
        return service.close();
    });

    it('', function() {
    });
});
