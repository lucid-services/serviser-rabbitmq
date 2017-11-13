const Stream = require('stream');
const _      = require('lodash');

module.exports = Request;
module.exports.Request = Request;


/**
 * @param {Object} msg - amqp message object
 * @param {Object} msg.properties
 * @param {Object} msg.fields
 * @param {Buffer} msg.content
 * @param {Socket} socket
 * @param {Object} options - stream.Readable constructor options
 * @constructor
 */
function Request(msg, socket, options) {
    Stream.Readable.call(this, Object.assign({}, options, {objectMode: true}));

    this.msg     = msg;
    this.socket = socket;
    this.headers = {
        'content-type': msg.properties.contentType,
        'content-encoding': msg.properties.contentEncoding
    };
    this.UID     = msg.properties.messageId || msg.properties.correlationId;
    this.body    = null; // message data
    this.res     = null; //reference to the response object

    Object.keys(msg.properties.headers || {}).forEach(function(key) {
        this.headers[_.kebabCase(key).toLowerCase()] = msg.properties.headers[key];
    });

    ['ack', 'requeue', 'discard'].forEach(function(method) {
        if (this.socket[method] instanceof Function) {
            this[method] = this.socket[method].bind(this.socket);
        }
    }, this);
}

Request.prototype = Object.create(Stream.Readable.prototype, {
    constructor: Request
});

/**
 * @param {String} name
 * @return {String|undefined}
 */
Request.prototype.header = function(name) {
    return this.headers[name];
};

/**
 * @private
 */
Request.prototype._read = function() {
    this.push(this.msg.content);
    this.push(null);
};
