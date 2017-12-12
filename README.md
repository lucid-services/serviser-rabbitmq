[![Build Status](https://travis-ci.org/BohemiaInteractive/bi-service-rabbitmq.svg?branch=master)](https://travis-ci.org/BohemiaInteractive/bi-service-rabbitmq)   

Implementation of bi-service's `AppInterface` which allows to define receiving endpoints of `AMQP 0.9.1` in the same manner `http(s)` routes would be defined.  
Uses [forked](https://github.com/BohemiaInteractive/bi-rabbitmq) [rabbit.js](https://github.com/squaremo/rabbit.js) library under the hood.

### Usage

Load the plugin at the bottom of your `index.js` file:

```javascript
require('bi-service-rabbitmq'); //loads the plugin
```

Initialize a message queue App in your app.js file:

```javascript
service.buildMQApp('your-app-name-in-config.json5');
```

#### Example of `SUBSCRIBE` endpoint definition of `PUBLISH & SUBSCRIBE` pattern:


```javascript
const router = service.appManager
    .get('your-app-name-in-config.json5')
    .buildRouter({
        version: 1,
        url: '.'
    });

router.buildRoute({
    url: 'email-updated',
    type: 'subscribe', // one of: subscribe|pull|reply|worker
    summary: 'Sync user email',
    amqp: {/*amqp specific options*/},
    sdkMethodName: 'email-updated'
}).main(function(req) {
    return User.update({email: req.body.email});
});
```

#### `PUBLISH` data on client side:

```javascript
//bi-service based project...
const rabbit           = require('bi-rabbitmq');
const remoteServiceMgr = service.getRemoteServiceManager();
const resourceManager  = service.resourceManager;

const amqp = rabbit.createConnection('amqp://username:password@localhost:5672/vhost');

resourceManager.register('amqp', amqp);

const sdk = remoteServiceMgr.buildRemoteService('user:<your-app-name>:v1.0', {socket: amqp});
const socket = sdk.get('email-updated');

socket.write('new@email.com');
```

See [client SDKs integration](https://bohemiainteractive.github.io/bi-service/tutorial-4.SDK-integration.html)

#### Route `type`s

as described under [socket types](http://www.squaremobius.net/rabbit.js/) section of `rabbit.js` documentation.

### Tests

```bash
> export AMQP_URI='amqp://username:password@localhost:5672/vhost'
> npm test
```
