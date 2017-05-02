/**
 * Created with JetBrains WebStorm.
 * User: kilua
 * Date: 13-9-25
 * Time: 上午10:57
 * To change this template use File | Settings | File Templates.
 */

var serverInfoDao = module.exports = {};

serverInfoDao.getServerList = function (dbClient, cb) {
    var sql = 'SELECT ID,name,IP,port,uptime,clientVersion,resVersion,packages,pkgUrl,alias,clientMinVer,flag,tips ,doMainName FROM serverinfo order by ID desc'
        , args = [];
    dbClient.query(sql, args, function (err, servers) {
        if (!!err) {
            console.error('getServerList failed!err = %s', err.stack);
            cb(err.message, null);
        } else {
            // 将包名白名单拆分成数组
            servers = servers || [];
            servers.map(function (serverInfo) {
                serverInfo.packages = serverInfo.packages || '';
                serverInfo.packages = serverInfo.packages.split(',');
                return serverInfo;
            });
            cb(null, servers);
        }
    });
};

serverInfoDao.getServerInfoByID = function (dbClient, serverId, cb) {
    var sql = 'SELECT ID, name, IP FROM serverinfo WHERE ID = ?',
        args = [serverId];
    dbClient.query(sql, args, function (err, servers) {
        if (!!err) {
            console.error('getServerInfoByID err = %s, args = %j', err.stack, args);
            cb(err.message);
        } else {
            if (!!servers && servers.length > 0) {
                cb(null, servers[0]);
            } else {
                console.info('getServerInfoByID failed!args = %j', args);
                cb();
            }
        }
    });
};

/*
 *   name is a primary key, so that upsert can be applied.
 * */
serverInfoDao.pushServerInfo = function (dbClient, serverInfo, cb) {
    var sql = 'INSERT INTO serverinfo(name,IP,port,startTime,uptime,onlineCnt,maxOnlineCnt,clientVersion,resVersion,' +
            'packages,pkgUrl,alias,clientMinVer,flag,tips,doMainName) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE' +
        ' name=VALUES(name), IP=VALUES(IP),port=VALUES(port),uptime=VALUES(uptime),onlineCnt=VALUES(onlineCnt),' +
        'maxOnlineCnt=VALUES(maxOnlineCnt),clientVersion=VALUES(clientVersion),resVersion=VALUES(resVersion),' +
        'pkgUrl=VALUES(pkgUrl),clientMinVer=VALUES(clientMinVer),flag=VALUES(flag),tips=VALUES(tips)',
        now = Date.now(),
        args = [serverInfo.name, serverInfo.ip, serverInfo.port, now, now, serverInfo.onlineCnt, serverInfo.maxOnlineCnt,
            serverInfo.clientVersion, serverInfo.resVersion, serverInfo.packages, serverInfo.pkgUrl, serverInfo.alias,
            serverInfo.clientMinVer, serverInfo.flag, serverInfo.tips,serverInfo.doMainName];
    dbClient.query(sql, args, function (err, res) {
        if (err) {
            console.error('pushServerInfo failed!err = %s', err.stack);
            cb(err.message, false);
        } else {
            if (!!res && res.affectedRows > 0) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    });
};
