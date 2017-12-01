const Promise   = require('bluebird');
const _         = require('lodash');
const chai      = require('chai');
const sinonChai = require("sinon-chai");
const sinon     = require('sinon');
const Service   = require('bi-service');
const rabbit    = require('bi-rabbitmq');
const service   = require('../sample/index.js');

const expect = chai.expect;

chai.use(sinonChai);
chai.should();

describe('RABBITMQ', function() {

    before(function() {
        const self = this;
        return service.listen().bind(this).then(function() {
            this.app = service.appManager.get('rabbit');
            //this.client = rabbit.createContext(this.app.$getBrokerURI());
            this.client = this.app.connection;

            //return Promise.fromCallback(function(cb) {
                //self.client.on('ready', function(con) {
                    //cb();
                //});
            //});
        });
    });

    after(function() {
        return service.close();
    });

    describe('PUSH & PULL', function() {
        beforeEach(function() {
            this.route = this.app.getRoute('amqp_pull_v1.0');
            this.spy = (_.find(this.route.steps, ['name', 'main']) || {}).fn;

            this.socket = this.client.socket('PUSH', {
                contentType: 'application/json'
            });
        });

        afterEach(function() {
            this.socket.close();
            this.spy.reset();
        });

        it('should receive pushed message', function(done) {
            const self = this;
            const data = {
                email: 'test@test.com',
                username: 'test'
            };

            this.socket.on('error', done);
            this.socket.connect(this.route.getUrl(), function() {
                self.socket.write(JSON.stringify(data));

                setTimeout(function() {
                    self.spy.should.have.been.calledOnce;
                    self.spy.should.have.been.calledWith(sinon.match(function(req) {
                        req.body.should.have.been.eql(data);
                        req.headers.should.have.been.eql({
                            'content-type': 'application/json',
                            'content-encoding': undefined,
                        });
                        return true;
                    }));
                    done();
                }, 250)
            });
        });

        it('should strip received unsupported data properties', function(done) {
            const self = this;
            const data = {
                email: 'test@test.com',
                username: 'test'
            };

            this.socket.on('error', done);
            this.socket.connect(this.route.getUrl(), function() {
                self.socket.write(JSON.stringify(Object.assign({
                    unsupported: 'prop',
                    invalid: 'value',
                }, data)));

                setTimeout(function() {
                    self.spy.should.have.been.calledOnce;
                    self.spy.should.have.been.calledWith(sinon.match(function(req) {
                        req.body.should.have.been.eql(data);
                        return true;
                    }));
                    done();
                }, 250)
            });
        });
    });

    describe('PUBLISH & SUBSCRIBE', function() {
        beforeEach(function() {
            this.route = this.app.getRoute('amqp_subscribe_v1.0');
            this.spy = (_.find(this.route.steps, ['name', 'main']) || {}).fn;

            this.socket = this.client.socket('PUBLISH', {
                contentType: 'application/json'
            });
        });

        afterEach(function() {
            this.socket.close();
            this.spy.reset();
        });

        it('should receive published message', function(done) {
            const self = this;
            const data = {
                email: 'test@test.com',
                username: 'test'
            };

            this.socket.on('error', done);
            this.socket.connect(this.route.getUrl(), function() {
                self.socket.write(JSON.stringify(data));

                setTimeout(function() {
                    self.spy.should.have.been.calledOnce;
                    self.spy.should.have.been.calledWith(sinon.match(function(req) {
                        req.body.should.have.been.eql(data);
                        req.headers.should.have.been.eql({
                            'content-type': 'application/json',
                            'content-encoding': undefined,
                        });
                        return true;
                    }));
                    done();
                }, 250)
            });
        });
    });

    describe('REQUEST & REPLY', function() {
        beforeEach(function() {
            this.route = this.app.getRoute('amqp_reply_v1.0');

            this.socket = this.client.socket('REQUEST', {
                contentType: 'application/json'
            });
        });

        afterEach(function() {
            this.socket.close();
        });

        it('should respond with received data', function(done) {
            const self = this;
            const data = {
                email: 'test@test.com',
                username: 'test'
            };

            this.socket.on('error', done);

            this.socket.on('data', function(msg) {
                msg.should.have.property('fields');
                msg.should.have.property('properties');
                msg.should.have.property('content');
                JSON.parse(msg.content.toString()).should.be.eql(data);
                done();
            });
            this.socket.connect(this.route.getUrl(), function() {
                self.socket.write(JSON.stringify(data));
            });
        });
    });

    describe('PUSH & WORKER', function() {
        beforeEach(function() {
            this.route = this.app.getRoute('amqp_worker_v1.0');
            this.spy = (_.find(this.route.steps, ['name', 'main']) || {}).fn;

            this.socket = this.client.socket('PUSH', {
                contentType: 'application/json'
            });
        });

        afterEach(function() {
            this.socket.close();
            this.spy.reset();
        });

        it('should receive pushed message', function(done) {
            const self = this;
            const data = {
                email: 'test@test.com',
                username: 'test'
            };

            this.socket.on('error', done);
            this.socket.connect(this.route.getUrl(), function() {
                self.socket.write(JSON.stringify(data));

                setTimeout(function() {
                    self.spy.should.have.been.calledOnce;
                    self.spy.should.have.been.calledWith(sinon.match(function(req) {
                        req.body.should.have.been.eql(data);
                        req.headers.should.have.been.eql({
                            'content-type': 'application/json',
                            'content-encoding': undefined,
                        });
                        return true;
                    }));
                    done();
                }, 250)
            });
        });
    });
});
