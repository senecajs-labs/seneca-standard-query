![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) data storage plugin

seneca-standard-query
=======================

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Dependency Status][david-badge]][david-url]
[![Gitter][gitter-badge]][gitter-url]

seneca-standard-query is a plugin for the [Seneca][seneca] MVP toolkit that provides the query building capabilites of the [Seneca][seneca] store plugins. It currently works with [seneca-postgres-store][postgres-store] and [seneca-mysql-store][mysql-store].
Its functionality can be extended by using the [seneca-store-query][store-query] plugin

The plugin is used internally by the Seneca stores.

Usage sample:

```js
    var Seneca = require('seneca')
    var si = Seneca()

    var DBConfig = {
      name: 'senecatest',
      host: 'localhost',
      username: 'senecatest',
      password: 'senecatest',
      port: 5432
    }
    ...

    si.use(require('seneca-postgres-store'), DBConfig)
    si.ready(function() {
      var product = si.make('product')
      ...
    })
    ...
```

## Usage

You don't use this module directly. It provides an underlying data storage engine for the Seneca entity API:

```js
var entity = seneca.make$('typename')
entity.someproperty = "something"
entity.anotherproperty = 100

entity.save$(function (err, entity) { ... })
entity.load$({id: ...}, function (err, entity) { ... })
entity.list$({property: ...}, function (err, entity) { ... })
entity.remove$({id: ...}, function (err, entity) { ... })
```

### Query Support

The standard Seneca query format is supported:
- `.list$({f1:v1, f2:v2, ...})` implies pseudo-query `f1==v1 AND f2==v2, ...`.

- `.list$({f1:v1, ...}, {sort$:{field1:1}})` means sort by f1, ascending.

- `.list$({f1:v1, ...}, {sort$:{field1:-1}})` means sort by f1, descending.

- `.list$({f1:v1, ...}, {limit$:10})` means only return 10 results.

- `.list$({f1:v1, ...}, {skip$:5})` means skip the first 5.

- `.list$({f1:v1,...}, {fields$:['fd1','f2']})` means only return the listed fields.

## Column name transformation, backward compatibility

To generate queries backward compatible with previous seneca plugin versions that were converting database column CamelCase names to Snake case names or just applying name transformations it is possible to pass as options functions that convert column names to database column names like the following:

```js
var DefaultConfig = {
...
  fromColumnName: function (attr) {
    // apply some conversion on column names
    return attr.toUpperCase()
  },
  toColumnName: function (attr) {
    // convert back column names
    return attr.toLowerCase()
  }
}
seneca.use(require('seneca-postgres-store'), DefaultConfig)
```

## Limits

By default queries are limited to 20 values. This can be bypassed by passing the `nolimit` option, which if set to true will not limit any queries.

## Fields

To filter the fields returned from the `list` operation, pass a `fields$` array of column names to return. If no `fields$` are passed, all fields are returned (i.e. `select *` is used). e.g.

    query.fields$ = ['id', 'name']


Note: The implicit id that is generated on save$ has an uuid value. To override this you must provide entity.id$ with a desired value.

## Running tests

To run the tests you need to have the docker image built and running, that is made executing `npm run build` then `npm run start`
In another console execute `npm test`

## Contributing
We encourage participation. If you feel you can help in any way, be it with
examples, extra testing, or new features please get in touch.


[npm-badge]: https://img.shields.io/npm/v/seneca-standard-query.svg
[npm-url]: https://npmjs.com/package/seneca-standard-query
[travis-badge]: https://api.travis-ci.org/senecajs/seneca-standard-query.svg
[travis-url]: https://travis-ci.org/senecajs/seneca-standard-query
[david-badge]: https://david-dm.org/senecajs/seneca-standard-query.svg
[david-url]: https://david-dm.org/senecajs/seneca-standard-query
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[seneca]: http://senecajs.org/
[postgres-store]: https://github.com/senecajs/seneca-postgres-store
[mysql-store]: https://github.com/senecajs/seneca-mysql-store
[store-query]: https://github.com/senecajs/seneca-store-query
