var request = require('request')
    , fs = require('fs')
    , should = require('should')
    , dbClient = require('../dao/mysql/mysql')
    , async = require('async')
    , loadCfg = require('../config/load.json');

//var options = {
//    //uri: 'http://my-site.com:3000/serverList',
//    uri: 'http://kilua.devel.tiantong.com:3000/serverList',
//	method: 'GET',
//    json: {
//        "MAC": "D4-3D-7E-B8-ED-E7"
//        , "userName": "Kilua626"
//    }
//};
//
//request(options, function (error, response, body) {
//    if (!error && response.statusCode == 200) {
////        console.log(body.id); // Print the shortened url.
//        console.log('body:%j', body);
////        console.log('response:%j', response);
//    }else{
//        console.log(error);
//    }
//});

//var URL = 'http://domain.tiantong.com:3000';
var URL = 'http://192.168.1.150:3000';

function clearServerInfo(dbClient, cb){
    var sql = 'DELETE FROM serverInfo'
        , args = [];
    dbClient.query(sql, args, function(err, res){
        cb();
    });
}

function clearUserInfo(dbClient, cb){
    var sql = 'DELETE FROM UserInfo'
        , args = [];
    dbClient.query(sql, args, function(err, res){
        cb();
    });
}

function clearDB(dbClient, cb){
    async.parallel([
        function(callback){
            clearServerInfo(dbClient, callback);
        }
        , function(callback){
            clearUserInfo(dbClient, callback);
        }
    ], function(err, results){
        cb();
    });
}

// fill dummy server info.
function fillDummyServerInfo(dbClient, serverList, cb){
    var sql = 'INSERT INTO serverInfo(name,IP,port,onlineCnt,maxOnlineCnt,uptime) VALUES ?';

    function convertServerInfoAsArray(slist){
        var result = [], server;
        for(var i = 0; i < slist.length; i++){
            server = slist[i];
            result.push([server.name, server.IP, server.port, server.onlineCnt, server.maxOnlineCnt
                , server.uptime]);
        }
        return result;
    }

    dbClient.query(sql, [convertServerInfoAsArray(serverList)], function(err, res){
        if(err){
            console.error('fillDummyServerInfo err = %s', err.stack);
        }
        console.log('fillDummyServerInfo res = %j', res);
        // attach 'ID' property accordingly.
        for(var i = 0; i < serverList.length; i++){
            serverList[i].ID = res.insertId + i;
        }

        cb();
    });
}
// create dummy data.
function createDummyServerData(maxCnt){
    var serverInfo, servers = [];
    for(var i = 0; i < maxCnt; i++){
        serverInfo = {};
        serverInfo.name = 'server_' + (i + 1);
        serverInfo.IP = '192.168.1.' + (i + 1);
        serverInfo.port = 3000;
        serverInfo.onlineCnt = Math.floor(Math.random() * 1000);
        serverInfo.maxOnlineCnt = 1000;
        serverInfo.uptime = Math.floor(Math.random()) * 1000 + Date.now();
        serverInfo.versions = '1.1.11';

        servers.push(serverInfo);
    }
    return servers;
}

function fillDummyUserData(dbClient, userList, cb){
    function convertUserInfoAsArray(ulist){
        var result = [], user;
        for(var i = 0; i < ulist.length; i++){
            user = ulist[i];
            result.push([user.MAC, user.serverName, user.uptime]);
        }
        return result;
    }

    var sql = 'INSERT INTO UserInfo(MAC,serverName,uptime) VALUES ?';
    dbClient.query(sql, [convertUserInfoAsArray(userList)], function(err, res){
        cb();
    });
}

function createDummyUserData(maxCnt, serverList){
    var userInfo, users = [];
    for(var i = 0; i < maxCnt; i++){
        userInfo = {};
        userInfo.MAC = 'D4-3D-7E-B8-ED-E' + i; // just mock mac.
        userInfo.serverName = serverList[Math.floor(Math.random() * serverList.length)].name;
        userInfo.uptime = Math.floor(Math.random() * 1000) + Date.now();

        users.push(userInfo);
    }
    return users;
}

function sortByIDDesc(server1, server2){
    return (server2.ID - server1.ID);
}

describe('serverManager', function(){
    before(function(){
        dbClient.init();
    });

    describe('#all_empty', function(){
        before(function(done){
            clearDB(dbClient, done);
        });

        it('should response with status ok!', function(done){
            var options = {
                //uri: 'http://my-site.com:3000/serverList',
                uri: URL + '/serverList?MAC=D4-3D-7E-B8-ED-E7',
                method: 'GET'
//                , json: {
//                    "MAC": "D4-3D-7E-B8-ED-E7"
//                    , "userName": "Kilua626"
//                }
            };
            request(options, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
                should.exist(body);
                body = JSON.parse(body);
//                console.info('body = %s', body);
//                body.should.have.property('serverList', []);
                should.exist(body.serverList);
                body.serverList.length.should.equal(0);

                done();
            });
        });
    });

    describe('#empty_userInfo', function(){
        var serverList;
        before(function(done){
            clearDB(dbClient, function(){
                serverList = createDummyServerData(10);
                fillDummyServerInfo(dbClient, serverList, done);
            });
        });

        it('should response with a server list of length that matches the dummy data order by ID desc and the' +
            ' the properties of every record of the server list should matches the dummy data, too!'
            , function(done){
                var options = {
                    //uri: 'http://my-site.com:3000/serverList',
                    uri: URL + '/serverList?MAC=D4-3D-7E-B8-ED-E7',
                    method: 'GET'
//                    , json: {
//                        "MAC": "D4-3D-7E-B8-ED-E7"
//                        , "userName": "Kilua626"
//                    }
                };
                request(options, function (error, response, body) {
                    should.not.exist(error);
                    response.statusCode.should.equal(200);
                    should.exist(body);
                    body = JSON.parse(body);
                    should.exist(body.serverList);
                    body.serverList.length.should.equal(serverList.length);
//                    console.info('[empty_userInfo] serverList(unsorted) = %j', serverList);
                    serverList.sort(sortByIDDesc);

                    var resultServerList = body.serverList, resultServerInfo;
//                    console.info('[empty_userInfo] resultServerList = %j', resultServerList);
//                    console.info('[empty_userInfo] serverList(sorted) = %j', serverList);
                    for(var i = 0; i < serverList.length; i++){
                        var serverInfo = serverList[i], resultServerInfo = resultServerList[i];
                        for(var key in resultServerInfo){
//                            if(key === 'load'){
//                                resultServerInfo.should.have.property('load', serverInfo.onlineCnt / serverInfo.maxOnlineCnt * 100);
//                                continue;
//                            }
                            if(key === 'isHot'){
                                resultServerInfo.should.have.property('isHot', serverInfo.onlineCnt / serverInfo.maxOnlineCnt * 100 > loadCfg.hot_load);
                                continue;
                            }
                            resultServerInfo.should.have.property(key, serverInfo[key]);
                        }
                    }

                    done();
                });
            }
        );

        after(function(done){
            clearDB(dbClient, done);
        });
    });

    describe('#serverInfo_userInfo_both_not_empty', function(){
        var serverList, userList;
        before(function(done){
            clearDB(dbClient, function(){
                serverList = createDummyServerData(10);
                fillDummyServerInfo(dbClient, serverList, function(){
                    userList = createDummyUserData(10, serverList);
                    fillDummyUserData(dbClient, userList, done);
                });
            });
        });

        it('should response with an object that has a property called \'lastServerName\'', function(done){
            var options = {
                //uri: 'http://my-site.com:3000/serverList',
                uri: URL + '/serverList?MAC=D4-3D-7E-B8-ED-E0',
                method: 'GET'
//                , json: {
//                    "MAC": "D4-3D-7E-B8-ED-E0"
//                    , "userName": "Kilua626"
//                }
            };
            request(options, function (error, response, body) {
                should.not.exist(error);
                should.exist(body);
                body = JSON.parse(body);
                response.statusCode.should.equal(200);
                should.exist(body.serverList);
                body.serverList.length.should.equal(serverList.length);
//                console.info('[serverInfo_userInfo_both_not_empty] serverList = %j', serverList);
//                console.info('[serverInfo_userInfo_both_not_empty] userList = %j', userList);
                console.info('[serverInfo_userInfo_both_not_empty] response body = %j', body);
                should.exist(body.lastServerName);
                body.lastServerName.should.equal(userList[0].serverName);
                done();
            });
        });

        after(function(done){
            clearDB(dbClient, done);
        });
    });

    describe('#pushServerInfo', function(){
        it('should response with status ok!', function(done){
            var options = {
                uri: URL + '/pushServerInfo',
                method: 'POST',
                json: {
                    "name": "server1"
                    , "ip": "192.168.1.11"
                    , "port": 3001
                    , "online": 101
                    , "max": 1000
                }
            };
            request(options, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
//                console.info('#pushServerInfo response = %j, body = %j', response, body);
                done();
            });
        });

        after(function(done){
            clearServerInfo(dbClient, done);
        });
    });

    describe('#pushUserInfo', function(){
        it('should response with status ok!', function(done){
            var options = {
                uri: URL + '/pushUserInfo',
                method: 'POST',
                json: {
                    "MAC": "D4-3D-7E-B8-ED-E7"
                    , "serverName": "server1"
                }
            };
            request(options, function (error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);
//                console.info('#pushServerInfo response = %j, body = %j', response, body);
                done();
            });
        });

        after(function(done){
            clearUserInfo(dbClient, done);
        });
    });

    after(function(){
        dbClient.shutdown();
    });
});