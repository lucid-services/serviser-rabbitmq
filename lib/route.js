'use strict';

const _  = require('lodash');

const service       = require('bi-service');
const RouteType     = require('./routeType.js');
const reqBodyParser = require('./middleware/requestContentType.js');

const RouteI          = service.common.Route;
const Response        = service.Response;
const RouteError      = service.error.RouteError;
const ServiceError    = service.error.ServiceError;
const ValidationError = service.error.ValidationError;

module.exports = Route;

/**
 * @param {Object} options
 * @param {String} [options.name]
 * @param {String} options.type - see {@link RouteType} enum for available option values
 * @param {String} options.url
 * @param {String} options.summary - swagger doc
 * @param {String} options.desc - swagger doc
 * @param {String} options.sdkMethodName - client sdk method name
 *
 * @throws {RouteError}
 * @extends RouteInterface
 * @constructor
 **/
function Route(options) {
    options = options || {};
    const self = this;

    if (   typeof options.type !== 'string'
        || _.values(RouteType).indexOf(options.type.toUpperCase()) === -1
    ) {
        throw new RouteError('Invalid request type, got: ' + options.type);
    }

    RouteI.call(this, options);

    this.socket = null;
    this.options.type = RouteType[options.type.toUpperCase()];
    this.options.url = this.Router.$normalizeUrl(options.url);

    this.$setContentTypeParser(reqBodyParser);
    this.step('init', function(req, res) {
        //bind custom methods to the express res object
        Response.wrap(res, self);
    });
};

Route.prototype = Object.create(RouteI.prototype, {
    constructor: Route
});

/**
 * @return {String} - routing key
 */
Route.prototype.getUrl = function getUrl() {
    //we need to normalize the url when Router's url is just '/'
    return this.Router.$normalizeUrl(this.Router.getUrl() + this.options.url);
};

/**
 * @function
 * @return {String} - routing key
 */
Route.prototype.getAbsoluteUrl = Route.prototype.getUrl;

/**
 * returns route's name. If no name has been assigned,
 * the name is dynamically created from route's url path
 *
 * @return {String}
 */
Route.prototype.getName = function() {
    if (this.options.name) {
        return this.options.name;
    }

    var name = ''
    ,   url = this.Router.getUrl() + this.options.url;

    //assign default route uid which we make up from route's endpoint
    url.split('.').forEach(function(segment) {
        var pattern = '^({version}|\\*|\\#)$';
        if (!segment.match(pattern)) {
            name += _.upperFirst(segment.toLowerCase());
        }
    });

    return name;
};

/**
 * @private
 * @param {String} format
 * @return {String}
 */
Route.prototype.$formatUid = function(format) {
    var type    = this.options.type.toLowerCase();
    var name    = this.getName();
    var version = this.Router.$getVersionString();

    if (format.match(/{version}/g) && !version) {
        throw new RouteError('Can not format route UID, expected url version but got: ' + version);
    }

    format = format.replace(/{method}/g, type);
    format = format.replace(/{Method}/g, _.upperFirst(type));
    format = format.replace(/{name}/g, _.lowerFirst(name));
    format = format.replace(/{Name}/g, _.upperFirst(name));
    format = format.replace(/{version}/g, version);

    return format;
};
