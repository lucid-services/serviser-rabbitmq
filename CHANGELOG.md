
## v0.2.1

* [CHANGED] - changed project name to `serviser-rabbitmq`

## v0.2.0

* [FIXED] - provide own implementation of `App.prototype.close` method so that underlying amqp connection can be closed

## v0.1.3

* [FIXED] - when `AMQP` connection string does not have any query tunning parameters, no "?" character should be appended

## v0.1.2

* [ADDED] - `createConnection` helper method available on `module.exports` object
* [ADDED] - support for optional amqp connection tunning parameters `frameMax` & `channelMax` & `heartbeat`

## v0.1.1

* [CHANGED] - `Route` type should be provided in lowercase format
* [ADDED] - `sub` alias of `subscribe` `Route` type

## v0.1.0

* [ADDED] - initial release
