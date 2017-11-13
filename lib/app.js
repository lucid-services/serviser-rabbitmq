'use strict';

module.exports = App;

const _       = require('lodash');
const Promise = require('bluebird');
const rabbit  = require('bi-rabbitmq');
const service = require('bi-service');

const AppStatus    = service.AppStatus;
const AppI         = service.common.App;
const Router       = require('./router.js');
const configSchema = require('./configSchema.js');
const Request      = require('./request.js');
const Response     = require('./response.js');
const RouteType    = require('./routeType.js');

/**
 * @param {AppManager}   appManager
 * @param {Config}       config - module
 * @param {Object}       options
 * @param {String}       options.name - app's name
 * @param {Object}       [options.validator] - Ajv validator initialization options
 * @param {Object|Array} [options.validator.schemas] - list of globally accessible schema definitions
 *
 * @emits App#status-changed
 * @emits App#pre-init
 * @emits App#post-init
 * @emits App#pre-build
 * @emits App#post-build
 * @emits App#build-router
 * @emits App#listening
 * @emits App#error
 * @emits App#unknown-error
 * @emits App#error-response
 * @extends AppInterface
 * @constructor
 **/
function App(appManager, config, options) {
    const app = this;

    this.middlewares = []; //"global" middleware stack
    this.connection = null; //amqp connection context object

    /**
     * App specific Router constructor
     * @name App#Router
     * @instance
     * @type {Function}
     */
    this.Router = function() {
        Router.apply(this, arguments);
    };
    this.Router.prototype = Object.create(Router.prototype);
    this.Router.prototype.constructor = Router;
    this.Router.prototype.App = this;

    if (   typeof config === 'object'
        && config !== null
        && config.setInspectionSchema instanceof Function
    ) {
        config.setInspectionSchema(configSchema);
    }

    //parent constructor
    AppI.call(this, appManager, config, options);
};

App.prototype = Object.create(AppI.prototype);
App.prototype.constructor = App;

/**
 * @private
 * @return {String}
 */
App.prototype.$getBrokerURI = function() {
    /* FORMAT
     * amqp://username:password@host:port/vhost
     */
    let amqp     = this.config.getOrFail('amqp')
    ,   username = amqp.username
    ,   password = amqp.password
    ,   host     = amqp.host
    ,   port     = amqp.port
    ,   vhost    = amqp.vhost
    ,   uri      = amqp.ssl ? 'amqps://' : 'amqp://';

    if (username) {
        uri += `${username}:${password}`;
    }

    if (host) {
        uri += `@${host}:${port}`;
    }

    //if null no leading "/" character should be present
    //ref:https://www.rabbitmq.com/uri-spec.html
    if (typeof vhost === 'string') {
        uri += `/${vhost.replace(/\//g, '%2f')}`;
    }

    return uri;
};

/**
 * @param {Function} [callback]
 * @return {undefined}
 */
App.prototype.use = function(cb) {
    this.middlewares.push(cb);
};


/**
 * @return {undefined}
 */
App.prototype.$init = function() {

    this.once('init', function() {
        this.on('error-response', function defaultResponse(err, res) {
            //response object is available only for amqp RPC aka. REPLY Route type
            if (res) {
                if (!res.headersSent) {
                    return res.json(err);
                }
            } else {
                this.emit('error', err);
            }
        });

        this.prependListener('error-response', function setStatusCode(err, res) {
            if (res) {
                res.status(err.code);
            }
        });
    });

    return AppI.prototype.$init.call(this);
};

/**
 * overrides abstract method
 * this is no-operation as we have to build and bind endpoints once
 * we have a valid connection.
 * @private
 */
App.prototype.build = noop;

/**
 * @private
 * @return {App}
 */
App.prototype.$build = function() {
    let app = this;

    process.nextTick(function() {
        app.emit('pre-build', app);
        app.connection.once('ready', function(channel) {
            app.routers.forEach(function(router) {
                router.routes.forEach(function(route) {
                    const cb = route.build();
                    const socket = app.connection.socket(route.options.type);
                    socket.on('error', function(err) {
                        app.emit('error', err);
                    });
                    route.socket = socket;
                    socket.on('data', function(msg) {
                        let res, req = new Request(msg, this);
                        if (route.options.type === RouteType.REPLY) {
                            res = new Response(this);
                            res.req = req;
                            req.res = res;
                        }

                        return Promise.each(app.middlewares, function(fn) {
                            return fn.call(route, req, res) || null;
                        }).then(function() {
                            return cb(req, res);
                        });
                    });
                    socket.connect(route.getUrl(), noop);
                });
            });
            app.emit('post-build', app);
        });
    });

    return app;
};

/**
 * @return {Object} bi-rabbitmq connection Context object
 */
App.prototype.listen = function() {

    let app = this;

    this.connection = rabbit.createContext(this.$getBrokerURI());
    this.$build();

    this.connection.on('error', function(err) {
        app.emit('error', err);
    });

    this.connection.once('ready', function(con) {
        app.server = con.connection.stream;
        app.$setStatus(AppStatus.OK);
        app.emit('listening', app);
    });

    return this.connection;
};

//
function noop() {}
