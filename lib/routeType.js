/**
 * @typedef RouteType
 * @type {Object}
 * @property {string} SUBSCRIBE
 * @property {string} SUB - aka. SUBSCRIBE
 * @property {string} PULL
 * @property {string} REPLY
 * @property {string} WORKER
 */
module.exports = Object.freeze({
    SUBSCRIBE : 'sub',
    SUB       : 'sub',
    PULL      : 'pull',
    REPLY     : 'reply',
    WORKER    : 'worker',
});
