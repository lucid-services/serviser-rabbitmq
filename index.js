const _            = require('lodash');
const service      = require('bi-service');
const rabbit       = require('bi-rabbitmq');
const App          = require('./lib/app.js');
const Router       = require('./lib/router.js');
const Route        = require('./lib/route.js');
const RouteType    = require('./lib/routeType.js');
const Request      = require('./lib/request.js');
const Response     = require('./lib/response.js');
const configSchema = require('./lib/configSchema.js');

service.AppManager.prototype.buildMQApp = buildMQApp;

function buildMQApp(config, options) {
    return this.$buildApp(App, config, options);
}

/**
 * syntax sugar for building an {@link App} via {@link AppManager#buildMQApp}
 *
 * @public
 * @param {String} name - one of the keys of `apps` service config section
 * @param {Object} [options] - see {@link AppInterface} constructor options
 * @return {App}
 */
service.Service.prototype.buildMQApp = function(name, options) {

    let defaults = {name: name};

    let conf = this.config.getOrFail(`apps:${name}`);
    conf = this.config.createLiteralProvider(conf);
    options = _.assign(defaults, options);

    return this.appManager.buildMQApp(conf, options);
};

module.exports.App          = App;
module.exports.Router       = Router;
module.exports.Route        = Route;
module.exports.RouteType    = RouteType;
module.exports.Request      = Request;
module.exports.Response     = Response;
module.exports.configSchema = configSchema;

module.exports.createConnection = function createConnection(url, connOpts) {
    return rabbit.createContext(url, connOpts);
};
