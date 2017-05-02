/**
 * Module dependencies.
 */
var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto');

var express = require('express'),
    chokidar = require('chokidar'),
    async = require('async');

var mysql = require('./dao/mysql/mysql'),
    serverList = require('./routes/serverList'),
    userInfo = require('./routes/userInfo'),
    createVersionList = require('./createVersionList'),
    config = require('./config/config'),
    order = require('./routes/order'),
    transform = require('./routes/transform'),
    transformDailyDao = require('./dao/transformDailyDao');

var PORT = 9999;
//    , HOST = 'my-site.com';
var PKG_INFO = {
        path: '../update-server/public',
        ext: '.zip'
    },
    TMP_FILE = './versions.json';

var app = express();

process.title = 'myServerMgr';

// all environments
app.set('port', config.port || PORT);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
}

if ('production' === app.get('env')) {
    app.use(express.errorHandler());
}

var dbClient = mysql.init();

function filterPkg(filename) {
    return (PKG_INFO.ext && path.extname(filename) !== PKG_INFO.ext);
}

function getFileMd5(filename) {
    var str = fs.readFileSync(filename, 'utf-8'),
        md5Sum = crypto.createHash('md5');
    md5Sum.update(str);
    return md5Sum.digest('hex');
}

function extractNoticeServerAlias(filename) {
    return path.basename(path.dirname(filename));
}

async.series([
    function (callback) {
        var watcher = chokidar.watch(PKG_INFO.path, {ignored: /[\/\\]\./, persistent: true});
        watcher
            .on('add', function (filename, stats) {
                console.log('add file %s size %s', filename, stats ? stats.size : 'unknown');
                if (filterPkg(filename)) {
                    return;
                }
                serverList.addPackage(createVersionList.extractPkgName(filename, PKG_INFO.ext), stats ? stats.size : 0);
            })
            .on('change', function (filename, stats) {
                console.log('change file %s size %s', filename, stats ? stats.size : 'unknown');
                if (filterPkg(filename)) {
                    return;
                }
                serverList.changePackage(createVersionList.extractPkgName(filename, PKG_INFO.ext), stats ? stats.size : 0);
            })
            .on('unlink', function (filename) {
                console.log('remove file %s', filename);
                if (filterPkg(filename)) {
                    return;
                }
                serverList.removePackage(createVersionList.extractPkgName(filename, PKG_INFO.ext));
            })
            .on('error', function (error) {
                console.error('watch %s err %s', PKG_INFO.path, error);
            })
            .on('ready', function () {
                callback();
            });
    },
    function (callback) {
        var watchDir = './config/notices',
            watcher = chokidar.watch(watchDir, {ignored: /[\/\\]\./, persistent: true});
        watcher
            .on('add', function (filename) {
                console.log('add file %s md5 %s', filename, getFileMd5(filename));
                serverList.replaceNotice(extractNoticeServerAlias(filename), getFileMd5(filename), fs.readFileSync(filename, 'utf-8'));
            })
            .on('change', function (filename) {
                console.log('add file %s md5 %s', filename, getFileMd5(filename));
                serverList.replaceNotice(extractNoticeServerAlias(filename), getFileMd5(filename), fs.readFileSync(filename, 'utf-8'));
            })
            .on('unlink', function (filename) {
                console.log('remove file %s', filename);
                serverList.removeNotice(extractNoticeServerAlias(filename));
            })
            .on('error', function (err) {
                console.error('watch %s err %s', watchDir, err);
            })
            .on('ready', function () {
                callback();
            });
    }
], function () {
    // routes
    app.get('/serverList', serverList.getServerList);
    app.post('/pushServerInfo', serverList.pushServerInfo);
    app.post('/pushUserInfo', userInfo.pushUserInfo);
    app.get('/getNotice', serverList.getNotice);



    // 转化率相关数据采集
    app.get('/selectServer', transform.selectServer);
    app.get('/loadSuccess', transform.loadSuccess);
    app.get('/logonSuccess', transform.logonSuccess);

    // ===============================================充值回调接口======================================================//
    app.get('/order_default',order.order_default);                                          // 做测试用的
    app.post('/order_guonei_ios', order.order_guonei_ios);                                  // 天瞳-国内-appstroe-ios
    app.post('/order_taiqi_guonei_ios', order.order_taiqi_guonei_ios);                     // 泰奇-国内-appstroe-ios
    app.post('/order_taiqi_hudong_android', order.order_taiqi_hudong_android);                     // 泰奇-国内-appstroe-ios
    // =================================================================================================================//

    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });

    setInterval(function () {
        var curTime = new Date();
        if (curTime.getHours() >= 23 && curTime.getMinutes() >= 59) {
            transformDailyDao.dailySample(dbClient, function (err, success) {
                console.info('dailySample %s', success ? 'ok' : 'fail');
            });
        }
    }, 60 * 1000);
});


