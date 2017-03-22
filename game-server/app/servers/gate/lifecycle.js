/**
 * Created by employee11 on 2015/12/3.
 */
var util = require('util');

var request = require('request');

//var stateReport = require('../../../config/stateReport');

var exp = module.exports;

exp.beforeStartup = function (app, cb) {
    cb();
};

exp.afterStartup = function (app, cb) {
    cb();
};

exp.beforeShutdown = function (app, cb) {
    cb();
};

exp.afterStartAll = function (app) {
    console.info('afterStartAll all server start ok!registering...');
    app.set('prepared', true);

    startStateReport(app);
};

function getServerInfo(app) {
    var serverInfo = {}, curServer = app.getCurServer();
    serverInfo.name = stateReport.name;
    serverInfo.ip = curServer.clientHost ? curServer.clientHost : curServer.host;
    serverInfo.port = curServer.clientPort;
    serverInfo.maxOnlineCnt = stateReport.maxClient;
    serverInfo.onlineCnt = app.get('onlineCnt');
    serverInfo.clientVersion = stateReport.clientVersion;
    serverInfo.clientMinVer = stateReport.clientMinVer;
    serverInfo.resVersion = stateReport.resVersion;
    serverInfo.packages = stateReport.packages;
    serverInfo.pkgUrl = stateReport.pkgUrl;
    serverInfo.alias = stateReport.alias;
    serverInfo.flag = stateReport.flag;
    serverInfo.tips = stateReport.tips;
    serverInfo.doMainName = stateReport.doMainName;
    return serverInfo;
}

function pushServerInfo(app) {
    var options = {
        uri: util.format('http://%s:%s/pushServerInfo', stateReport.host, stateReport.port),
        method: 'POST',
        json: getServerInfo(app)
    };

    request(options, function (err, res) {
        if (err) {
            console.log('pushServerInfo failed!err = %s', err.stack);
            return;
        }
        if (res.statusCode !== 200) {
            console.log('pushServerInfo failed!code = %s', res.statusCode);
        }
    });
}

function startStateReport(app) {
    //pushServerInfo(app);

    //setInterval(function () {
    //    pushServerInfo(app);
    //}, 30000);
}
