/**
 * Created by kilua on 2015-03-18.
 */

var exp = module.exports = {};

exp.getUserByName = function(dbClient, name, cb){
    var sql = 'SELECT * FROM AllUser WHERE name = ?';
    dbClient.query(sql, [name], function(err, res){
        if(err){
            console.error('getUserByName err = %s', err.stack);
            cb(err.message);
        }else{
            if(!!res && res.length === 1){
                cb(null, res[0]);
            }else{
                cb();
            }
        }
    });
};

exp.createUser = function(dbClient, name, pwd, cb){
    var sql = 'INSERT INTO AllUser(name,pwd) VALUES(?,?)',
        args = [name, pwd];
    dbClient.query(sql, args, function(err, res){
        if(err){
            console.error('createUser err = %s', err.stack);
            cb(err.message);
        }else{
            if(!!res && res.affectedRows === 1){
                cb(null, true);
            }else{
                cb(null, false);
            }
        }
    });
};