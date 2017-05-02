/**
 * Created by kilua on 2016/5/31 0031.
 */

var dao = module.exports = {};

dao.dailySample = function (dbClient, cb) {
    var sql = 'CALL dailySample()';
    dbClient.query(sql, [], function (err, res) {
        if (err) {
            console.error('dailySample err = %s', err.stack);
            cb(err.message, false);
        } else {
            cb(null, true);
        }
    });
};
