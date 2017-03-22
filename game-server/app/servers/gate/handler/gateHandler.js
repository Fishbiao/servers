/**
 * Created by lishaoshen on 2015/09/26.
 */

var crc = require('crc');
var Code = require('../../../../shared/code');

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

handler.queryEntry = function (msg, session, next) {
    var uid = msg.uid;

    if (!uid) {
        next(null, {
            code: Code.FAIL
        });
        return;
    }
    var connectors = this.app.getServersByType('connector') || [];
    if (connectors.length === 0) {
        return next(null, {code: Code.GATE.FA_NO_SERVER_AVAILABLE});
    }
    var index = Math.abs(crc.crc32(uid)) % connectors.length,
        res = connectors[index];

    next(null, {code: Code.OK, host: res.clientHost ? res.clientHost : res.host, port: res.clientPort});
};