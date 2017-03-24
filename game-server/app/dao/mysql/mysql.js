/**
 * Created by lishaoshen on 2015/10/11.
 */

// mysql CRUD
var sqlclient = module.exports;

//var _pool;

var NND = function () {

};

var pro = NND.prototype;

/*
 * Init sql connection pool
 * @param {Object} app The app for the server.
 */
pro.init = function (dbConfig) {
    this._pool = require('./dao-pool').createMysqlPool(dbConfig);
};

/**
 * Excute sql statement
 * @param {String} sql Statement The sql need to excute.
 * @param {Object} args The args for the sql.
 * @param {fuction} cb Callback function.
 *
 */
pro.query = function (sql, args, cb) {
    var self = this;
    self._pool.acquire(function (err, client) {
        if (!!err) {
            console.error('[sqlqueryErr] ' + err.stack);
            return;
        }
        client.query(sql, args, function (err, res) {
            self._pool.release(client);
            cb(err, res);
        });
    });
};

/**
 * Close connection pool.
 */
pro.shutdown = function () {
    this._pool.destroyAllNow();
};

/**
 * init database
 */
sqlclient.init = function (dbConfig) {
    var dbClient = new NND();
    dbClient.init(dbConfig);
    return dbClient;
};






