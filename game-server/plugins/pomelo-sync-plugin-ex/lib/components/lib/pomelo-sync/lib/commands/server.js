/**
 * Module dependencies.
 */
var async = require('async'),
    _ = require('underscore');

var utils = require('../utils/utils');
var invoke = utils.invoke;
var clone = utils.clone;
/**
 * 
 * invoke tick instant 
 *
 * @module
 *
 * @param {String} key
 * @param {Object}  val
 * @param {Function} cb
 *
 */
 exports.execSync = function(key,val,cb){
     this.rewriter.tick(key,val,cb);
 };

/**
 * exec add be synced data to queue 
 * invoke by timer
 *  
 * @module 
 */
/* exec参数说明
 *   @param {String} op 操作函数
 *   @param {Number} key 主键，对单一玩家唯一即可，仅用于合并单个玩家的统一操作
 *   @param {Object} rec 存储数据
 *   @param {Number} playerId 便于于玩家下线时flush玩家数据
 */
 exports.exec = function(){
    var mergerKey;
    switch (arguments.length) {
        case 2:
        this.enqueue(arguments[0],arguments[1]);
        break;
        case 3:
        mergerKey = [arguments[0],arguments[1]].join('');
        this.mergerMap[mergerKey] = {key:arguments[0],val:clone(arguments[2])};
        this.writeToAOF(arguments[0], [arguments[2]]);
        break;
        case 4:
            // merge by playerId, then by op, and finally by key.
            // playerId used for flushing the group of all type of player data when leaving.
            if(!this.groupByPlayerId[arguments[3]]){
                this.groupByPlayerId[arguments[3]] = {};
            }
            mergerKey = [arguments[0], arguments[1]].join('');
            this.groupByPlayerId[arguments[3]][mergerKey] = {key: arguments[0], val: clone(arguments[2])};
            this.writeToAOF(arguments[0], arguments[2], arguments[3]);
            break;
        default:
        break;
    }
};

/**
 * 
 * enqueue data  
 *
 * @param {String} key
 * @param {Object} val
 * 
 */
 exports.enqueue = function(key, val){
     var target = clone(val);
     if (!!target) {
      this.writeToAOF(key, [val]);
      this.flushQueue.push({key:key,val:val});
  }
};

/**
 * flush all data go head
 */
 exports.sync = function(){
     if (this.rewriter) {
      this.rewriter.sync(this);
  }
};
/**
 * reutrn queue is empty or not when shutdown server 
 *
 * @module 
 *
 */
 exports.isDone = function(){
    var writerEmpty = true,queueEmpty = false,mapEmpty = false, playerGroupDataEmpty = false;
    if (!!this.rewriter) {
     writerEmpty = this.rewriter.isDone();
 }
 queueEmpty = (this.flushQueue.getLength()===0);
 mapEmpty = (utils.getMapLength(this.mergerMap)===0);
 playerGroupDataEmpty = (utils.getMapLength(this.groupByPlayerId) === 0);
 return writerEmpty && queueEmpty && mapEmpty && playerGroupDataEmpty;
};

/*
 * 
 * flush single data to db
 * first remove from cache map
 */
 exports.flush = function(){
    var self = this, mergerKey;
     if(arguments.length >= 4){
         // arguments: op key val playerId
         // 立即将所有playerId相关数据写入数据库，并写入指定数据(下线标志位)
         var playerId = arguments[3],
             groupOfPlayerData = this.groupByPlayerId[playerId],
             newMergerKey = [arguments[0], arguments[1]].join(''),
             cb = arguments[4],
             op = arguments[0],
             val = arguments[2];
         async.each(_.pairs(groupOfPlayerData), function(item, callback){
             var mergeKey = item[0],
                 entry = item[1];
             self.writeToAOF([entry.key, ['_remove']].join(''), [!!entry]);
             delete groupOfPlayerData[mergeKey];
             if(mergeKey === newMergerKey){
                 // 和新数据进行合并:不写入，直接最后写入新数据
                 return callback();
             }
             self.writeToAOF(entry.key, [entry.val]);
             self.rewriter.flush(entry.key, entry.val, callback);
         }, function(err){
             delete self.groupByPlayerId[playerId];
             // 最后写入新数据
             self.writeToAOF(op, [val]);
             self.rewriter.flush(op, val, cb);
         });
     }else if (arguments.length>=3) {
        mergerKey = [arguments[0],arguments[1]].join('');
        var exists = this.mergerMap[mergerKey];
        if (!!exists) {
            this.writeToAOF([arguments[0],['_remove']].join(''),[exists]);
            delete this.mergerMap[mergerKey];
        } 
        this.writeToAOF(arguments[0], [arguments[2]]);
        return this.rewriter.flush(arguments[0],arguments[2]);
    }else {
        this.log.error('invaild arguments,flush must have at least 3 arguments');
        return false;
    }
};

/**
 * get dbsync info  INFO
 *
 *
 */
 exports.info = function(){
  var buf = ''
  , day = 86400000
  , uptime = new Date - this.server.start;

  this.dbs.forEach(function(db, i){
    var keys = Object.keys(db)
    , len = keys.length;
    if (len) {
      buf += 'db' + i + ':keys=' + len + ',expires=0\r\n';
  }
});

  return (buf);
};


