const _ = require('lodash');

module.exports = Response;
module.exports.Response = Response;

/**
 * @param {Socket} socket
 * @constructor
 */
function Response(socket) {
    this.req = null; //reference to the request object
    this.statusCode = null;
    this.headers = {};
    this.headersSent = false;
    this.socket = socket;
}

/**
 * @return {boolean}
 */
Response.prototype.write = function(chunk, encoding) {
    this.headersSent = true;
    return this.socket.write(chunk, encoding);
};

/**
 * @param {String} key
 * @param {String} value
 * @return {Response} - self
 */
Response.prototype.setHeader = function(key, value) {
    this.headers[_.kebabCase(key)] = value;
    return this;
};

/**
 * sets res contentType header
 * @param {String} mime
 * @return {Response} - self
 */
Response.prototype.type = function(mime) {
    this.headers['content-type'] = mime;
    return this;
};

/**
 * @param {Integer} status
 * @return {Response} - self
 */
Response.prototype.status = function(status) {
    this.statusCode     = status;
    this.headers.status = status;
    return this;
};

/**
 * @param {mixed} data
 * @return {boolean}
 */
Response.prototype.json = function(data) {
    return this.write(JSON.stringify(data));
};
