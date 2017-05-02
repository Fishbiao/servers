/**
 * Created with JetBrains WebStorm.
 * User: kilua
 * Date: 13-9-25
 * Time: 上午10:22
 * To change this template use File | Settings | File Templates.
 */

var url = require('url'),
    util = require('util');

var async = require('async'),
    _ = require('underscore');

var dbClient = require('../dao/mysql/mysql'),
    serverInfoDao = require('../dao/serverInfoDao'),
    transformDetailDao = require('../dao/transformDetailDao'),
    userDao = require('../dao/userDao'),
    config = require('../config/config.json'),
    languageConfig = require('../config/LanguageConfig.json'),
    createVersionList = require('../createVersionList'),
    dataApi = require('../dataApi'),
    utils = require('../utils');

/*
 *   截取资源包列表
 * */
function getResPkgList(versions, newestVersion) {
    var i, result = [];
    for (i = 0; i < versions.length; ++i) {
        if (createVersionList.cmpVersion(versions[i], newestVersion) > 0) {
            break;
        }
        result.push(versions[i]);
    }
    return result.join('\r\n');
}

function getRecentServerMap(recentServers) {
    var serverMap = {};
    if (!recentServers) {
        return serverMap;
    }
    for (var i = 0; i < recentServers.length; i++) {
        var serverInfo = recentServers[i];
        if (serverMap[serverInfo.servername]) {
            continue;
        }
        serverMap[serverInfo.servername] = serverInfo;
    }
    return serverMap;
}

function markHasRole(serverInfo, recentServerMap) {
    recentServerMap = recentServerMap || {};
    if (!serverInfo) {
        return;
    }
    //console.log('###markHasRole serverInfo = %j, recentServerMap = %j', serverInfo, recentServerMap);
    var loginRec = recentServerMap[serverInfo.name];
    if (!!loginRec) {
        serverInfo.hasRole = true;
        serverInfo.gender = loginRec.gender;
    } else {
        serverInfo.hasRole = false;
    }
    serverInfo.gender = serverInfo.gender || 0;
}

/*
 *   根据包名白名单过滤服务器列表
 * */
function filterServerListByPkg(serverList, pkg) {
    serverList = serverList || [];
    return serverList.filter(function (serverInfo) {
        // *号改为匹配任何关键字
        if (_.contains(serverInfo.packages, '*')) {
            return true;
        }
        return _.contains(serverInfo.packages, pkg);
    });
}

/*
 *   是否送审版本
 * */
function isAuditVersion(ver, auditVer) {
    // 若不设置，表示全部都是正式版本
    return (!!auditVer && !!ver && createVersionList.cmpVersion(ver, auditVer) >= 0);
}

function filterServerListByVersion(serverList, clientVer, auditVer) {
    var isClientAudit = isAuditVersion(clientVer, auditVer),
        result;
    serverList = serverList || [];
    console.log('filterServerListByVersion isClientAudit = %s', isClientAudit);
    if (isClientAudit) {
        result = serverList.filter(function (serverInfo) {
            return isAuditVersion(serverInfo.clientVersion, auditVer);
        });
    } else {
        result = serverList.filter(function (serverInfo) {
            return !isAuditVersion(serverInfo.clientVersion, auditVer);
        });
    }
    return result;
}

function getBasePkgUrl(platform) {
    var platformConf = dataApi.PlatformConfig.findBy('platform', platform);
    if (!platformConf || platformConf.length !== 1) {
        return '';
    }
    return platformConf[0].basePkgUrl;
}

var allPkgs = [];

exports.addPackage = function (name, size) {
    allPkgs.push(util.format('%s#%s&', name, size));
    allPkgs.sort(createVersionList.cmpVersion);
};

exports.changePackage = function (name, size) {
    var idx = _.findIndex(allPkgs, function (pkgInfo) {
        var parts = pkgInfo.split('#');
        return (parts && parts.length >= 1 && (parts[0] === name));
    });
    if (idx !== -1) {
        allPkgs[idx] = util.format('%s#%s&', name, size);
    }
};

exports.removePackage = function (name) {
    allPkgs = _.reject(allPkgs, function (pkgInfo) {
        var parts = pkgInfo.split('#');
        return (parts && parts.length >= 1 && (parts[0] === name));
    });
};

var noticeDict = {};

//通过语言获取公共信息
function getConent( name, language) {
    console.log('serverList.getContent name : %s , language : %s', name , language);
    if( !name  ){
        logger.warn(' serverList.getConent()  name is null ');
        return {};
    }

    var notice = noticeDict[name];
    if( !notice ){
        logger.warn('not find noteData serverName : %s',name);
        return {};
    }
    var baseContent = notice.content;
    var content = notice.contentDic[language];
    if( !!content ){
        return content;
    }else{
        var contentTmp = JSON.parse(baseContent) ;
        //固定索引列
        var baseIndex = { 'id':true, "isNew":true,"textSize":true };

        //需要的列
        var needDataRow = {};
        contentTmp[1] =  _.map(contentTmp[1],function (indexNametmp,index) {
            //固定
            if( baseIndex[indexNametmp] ){
                needDataRow[index]=true;
                return indexNametmp;
            }
            //==========================================================================================================
            //动态部分
            if(indexNametmp == 'titleText_txt_'+language){
                needDataRow[index]=true;
                return 'titleText';
            }
            if(indexNametmp == 'text_txt_'+language){
                needDataRow[index]=true;
                return 'text';
            }
        });

        //更换字段名
        //------------------------------------------------------------------------------------------------------------------
        contentTmp = _.map( contentTmp,function (item , index ) {
            item = _.filter(item,function (data,rowIndex) {
                return needDataRow[rowIndex];
            });
            return item;
        });

        noticeDict[name].contentDic[language] = contentTmp;
        return contentTmp;
    }
    return baseContent;
};

exports.replaceNotice = function (name, md5, content) {
    noticeDict[name] = {name: name, md5: md5, content: content , contentDic:{}};
};

exports.removeNotice = function (name) {
    if (noticeDict[name]) {
        delete noticeDict[name];
    }
};

/*
 *   获取服务器列表
 *   @param {String} Mac 玩家帐号，用来获取最近登录服务器
 *   @param {String} package 包名，用来做白名单过滤
 *   @param {String} clientVersion 客户端代码版本号，用来做审核版本过滤
 *   @param {String} platform 平台，用来获取完整包下载地址
 *   @return 服务器列表
 * */
exports.getServerList = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        MAC = msg.MAC,
        pkg = msg.package,
        clientVersion = msg.clientVersion,
        //basePkgUrl = getBasePkgUrl(msg.platform),
        versions = allPkgs;
    console.info('query = %j, versions = %j', msg, versions);
    /*if (!MAC) {
        res.send({code: 500});
        return;
    }*/
    async.parallel([
        function (callback) {
            serverInfoDao.getServerList(dbClient, callback);
        }/*,
        function (callback) {
            userDao.getRecentServersByMAC(dbClient, MAC, callback);
        },
        function (callback) {
            transformDetailDao.save(dbClient, utils.getServerUserName(msg.platform, MAC), callback);
        }*/
    ], function (err, results) {
        if (!!err) {
            res.send({code: 501});
        } else {
            var sortedServerList = results[0],
                //sortedRecentServers = results[1],
                lastServerName, recentServerMap, resObj = {code: 200};
            /*if (!!sortedServerList) {
                // 报名过滤
                sortedServerList = filterServerListByPkg(sortedServerList, pkg);
                console.log('getServerList sortedServerList = %j', sortedServerList);
                if (!!sortedRecentServers && sortedRecentServers.length > 0) {
                    // 最近登录服务器
                    lastServerName = sortedRecentServers[0].servername;
                    console.info('getServerList last server found!name = %s, MAC = %s', lastServerName, MAC);
                    recentServerMap = getRecentServerMap(sortedRecentServers);
                    resObj.lastServerName = lastServerName;
                }
                resObj.serverList = sortedServerList;
            }
            // 筛选审核版本或正式版本的服务器
            resObj.serverList = filterServerListByVersion(resObj.serverList, clientVersion, config.auditVersion);
            // 附加完整包地址、更新包地址、是否有角色及性别及公告md5等信息
            resObj.serverList.map(function (serverInfo) {
                serverInfo.basePkgUrl = basePkgUrl;
                serverInfo.packages = getResPkgList(versions, serverInfo.resVersion);
                markHasRole(serverInfo, recentServerMap);
                if (noticeDict[serverInfo.alias]) {
                    serverInfo.noticeMd5 = noticeDict[serverInfo.alias].md5;
                }
            });*/
            resObj.serverList = sortedServerList;
            res.send(resObj);
        }
    });
};

/*
 *   开服时和定时推送服务器状态信息
 * */
exports.pushServerInfo = function (req, res) {
    var serverInfo = req.body, name = serverInfo.name, ip = serverInfo.ip, port = serverInfo.port;
    console.info('pushServerInfo serverInfo = %j', serverInfo);
    if (!name || !ip || !port) {
        res.send({code: 500});
        return;
    }

    serverInfoDao.pushServerInfo(dbClient, serverInfo, function (err, success) {
        if (!!err) {
            res.send({code: 501});
            return;
        }
        if (success) {
            res.send({code: 200});
        } else {
            res.send({code: 502});
        }
    });
};

exports.getNotice = function (req, res) {
    var url_parts = url.parse(req.url, true),
        msg = url_parts.query,
        alias = msg.alias,
        language = msg.language || languageConfig.language;

    var currNotice = noticeDict[alias];
    var temp = {};
    temp.name = currNotice.name;
    temp.md5 = currNotice.md5;
    temp.content = getConent(alias,language);

    var callBackJson = JSON.stringify(temp);
    res.send( callBackJson );

};