/**
 * Created with JetBrains WebStorm.
 * User: kilua
 * Date: 13-9-25
 * Time: 下午5:02
 * To change this template use File | Settings | File Templates.
 */

var dbClient = require('../dao/mysql/mysql')
    , userDao = require('../dao/userDao');

exports.pushUserInfo = function(req, res){
    var user = req.body, MAC = user.MAC, serverName = user.serverName;
    if(!user || !MAC || !serverName){
        res.send({code: 500});
        return;
    }
    userDao.pushUserInfo(dbClient, user, function(err, success){
        if(err){
            res.send({code: 501});
        }else{
            if(success){
                res.send({code: 200});
            }else{
                res.send({code: 501});
            }
        }
    });
};