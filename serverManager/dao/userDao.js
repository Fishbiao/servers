/**
 * Created with JetBrains WebStorm.
 * User: kilua
 * Date: 13-9-25
 * Time: 上午11:15
 * To change this template use File | Settings | File Templates.
 */

var userDao = module.exports = {};

userDao.getRecentServersByMAC = function(dbClient, MAC, cb){
    var sql = 'SELECT * FROM playerinfo WHERE MAC = ? order by latestLoginTime desc',
        args = [MAC];
    dbClient.query(sql, args, function(err, recentServers){
        if(!!err){
            console.error('getRecentServersByMAC failed!err = %s', err.stack);
            cb(err.message, null);
        }else{
            cb(null, recentServers);
        }
    });
};

userDao.pushUserInfo = function(dbClient, user, cb){
    var sql = 'INSERT INTO playerinfo(MAC,serverName,latestLoginTime) VALUES(?,?,?) ON DUPLICATE KEY UPDATE latestLoginTime=VALUES(latestLoginTime)',
        now = Date.now(),
        args = [user.MAC,user.serverName, now];
    dbClient.query(sql, args, function(err, res){
        if(err){
            console.error('pushUserInfo failed!err = %s', err.stack);
            cb(err.message, false);
        }else{
            if(!!res && res.affectedRows > 0){
                cb(null, true);
            }else{
                cb(null, false);
            }
        }
    });
};
