const _          = require('lodash');
const typeis     = require('type-is');
const service    = require('serviser');
const Promise    = require('bluebird');

const RequestError = service.error.RequestError;

/**
 * {Route} middleware which validates Content-Type header and parses the request
 * body
 */
module.exports = function requestContentTypeParserMiddleware(req, res) {
    const self = this;
    return Promise.try(function() {
        const type = req.header('content-type');

        let types        = self.route.$dataParserMiddleware.mediaTypes
        ,   mediaType    = typeis.is(type, types)
        ,   contentTypes = self.route.$dataParserMiddleware.contentTypes;


        if (type && mediaType) {
            let method = typeis.is(type, ['json', 'text', 'raw'])

            if (method) {
                return parse(method, req, res, contentTypes[mediaType]);
            } else if (   contentTypes.hasOwnProperty(mediaType)
                && typeof contentTypes[mediaType].parser === 'function'
            ) {
                return contentTypes[mediaType].parser(req);
            } else {
                return null;
            }
        }

        return Promise.reject(new RequestError(
            `Unsupported Content-Type: ${type}. Supported: ${types.join('|  ')}`
        ));
    }).then(function() {
        if (typeof req.body !== 'object' || typeof req.body === null) {
            req.body = {};
        }
        return null;
    });
};

/*
 * @private
 * body parser promise wrapper
 * @param {String} contentType
 * @param {Object} options
 * @return Promise
 */
function parse(contentType, req, res, options) {
    return new Promise(function(resolve, reject) {
        req.once('data', function(data) {
            try {
                switch (contentType) {
                    case 'json':
                        this.body = JSON.parse(data);
                    break;
                    case 'text':
                        this.body = data.toString();
                    break;
                    case 'raw':
                        this.body = data;
                    break;
                }
                return resolve();
            } catch(e) {
                return reject(e);
            }
        });
    });
}
