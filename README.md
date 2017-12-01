[![Build Status](https://travis-ci.org/BohemiaInteractive/bi-service-rabbitmq.svg?branch=master)](https://travis-ci.org/BohemiaInteractive/bi-service-rabbitmq)   

Implementation of bi-service's `AppInterface` which allows to define receiving endpoints of `AMQP 0.9.1` in the same manner `http(s)` routes would be defined.

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
}).main(function(req) {
    return User.update({email: req.body.email});
});
```

### Tests

```bash
> export AMQP_URI='amqp://username:password@localhost:5672/vhost'
> npm test
```
