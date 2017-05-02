/**
 * Created by kilua on 2016/5/31 0031.
 */

var dao = module.exports = {};

dao.save = function (dbClient, username, cb) {
    var sql = 'INSERT INTO TransformDetail(username,createTick,getServerList) VALUES(?,?,?) ON DUPLICATE KEY UPDATE' +
            ' getServerList=getServerList+1',
        args = [username, Date.now(), 1];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            console.error('save failed!err = %s, args = %j', err.stack, args);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};

dao.incSelectServer = function (dbClient, username, cb) {
    var sql = 'UPDATE TransformDetail SET selectServer = selectServer + 1 WHERE username = ?',
        args = [username];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            console.error('incSelectServer err = %s, args = %j', err.stack, args);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};

dao.incLoadSuccess = function (dbClient, username, cb) {
    var sql = 'UPDATE TransformDetail SET loadSuccess = loadSuccess + 1 WHERE username = ?',
        args = [username];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            console.error('incLoadSuccess err = %s, args = %j', err.stack, args);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};

dao.incLogonSuccess = function (dbClient, username, cb) {
    var sql = 'UPDATE TransformDetail SET logonSuccess = logonSuccess + 1 WHERE username = ?',
        args = [username];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            console.error('incLogonSuccess err = %s, args = %j', err.stack, args);
            cb(err.message, false);
        } else {
            cb(null, (!!res && res.affectedRows > 0));
        }
    });
};