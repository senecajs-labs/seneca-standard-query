'use strict'

var _ = require('lodash')
var actionRole = 'sql'
var name = 'standard-query'

module.exports = function queryBuilder (options) {
  var seneca = this

  var ColumnNameParsing = {
    fromColumnName: options.fromColumnName,
    toColumnName: options.toColumnName
  }
  var QueryBuilder = require('./lib/query-builder')(ColumnNameParsing)

  function specificTypes (storeName) {
    var sTypes = {
      escape: '"',
      prepared: '$'
    }
    sTypes.name = storeName

    if (storeName === 'mysql-store') {
      sTypes.escape = '`'
      sTypes.prepared = '?'
    }

    return sTypes
  }

  seneca.add({role: actionRole, hook: 'save'}, function (args, done) {
    var ent = args.ent
    var update = !!ent.id
    var query
    var autoIncrement = args.auto_increment || false
    var sTypes = specificTypes(args.target)

    if (update) {
      query = QueryBuilder.updatestm(ent, sTypes)
      return done(null, {query: query, operation: 'update'})
    }

    if (ent.id$) {
      ent.id = ent.id$
      query = QueryBuilder.savestm(ent, sTypes)
      return done(null, {query: query, operation: 'save'})
    }

    if (autoIncrement) {
      query = QueryBuilder.savestm(ent, sTypes)
      return done(null, {query: query, operation: 'save'})
    }

    seneca.act({role: actionRole, hook: 'generate_id', target: args.target}, function (err, result) {
      if (err) {
        seneca.log.error('hook generate_id failed')
        return done(err)
      }
      ent.id = result.id
      query = QueryBuilder.savestm(ent, sTypes)
      return done(null, {query: query, operation: 'save'})
    })
  })

  seneca.add({role: actionRole, hook: 'load'}, function (args, done) {
    var qent = args.qent
    var sTypes = specificTypes(args.target)
    var q = _.clone(args.q)
    q.limit$ = 1

    QueryBuilder.selectstm(qent, q, sTypes, function (err, query) {
      return done(err, {query: query})
    })
  })

  seneca.add({role: actionRole, hook: 'list'}, function (args, done) {
    var qent = args.qent
    var q = args.q
    var sTypes = specificTypes(args.target)

    QueryBuilder.buildSelectStatement(qent, q, sTypes, function (err, query) {
      return done(err, {query: query})
    })
  })

  seneca.add({role: actionRole, hook: 'remove'}, function (args, done) {
    var qent = args.qent
    var q = args.q
    var sTypes = specificTypes(args.target)

    var query = QueryBuilder.deletestm(qent, q, sTypes)
    return done(null, {query: query})
  })

  return {
    name: name,
    exportmap: {utils: {
      fixPrepStatement: QueryBuilder.fixPrepStatement,
      jsonSupport: QueryBuilder.jsonSupport,
      whereargs: QueryBuilder.whereargs,
      metaquery: QueryBuilder.metaquery,
      selectstmOr: QueryBuilder.selectstmOr,
      selectstmCustom: QueryBuilder.selectstmCustom,
      buildQueryFromExpressionCustom: QueryBuilder.buildQueryFromExpressionCustom,
      parseExpression: QueryBuilder.parseExpression,
      fromColumnName: QueryBuilder.fromColumnName,
      toColumnName: QueryBuilder.toColumnName,
      makeent: QueryBuilder.makeent,
      buildSelectStatementCustom: QueryBuilder.buildSelectStatementCustom
    }}
  }
}
