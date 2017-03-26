/**
 * Module dependencies.
 */
 var utils = require('../utils/utils');
 var invoke = utils.invoke;
/**
 * Initialize a new AOF Rewriter with the given `db`.
 * 
 * @param {options}
 * 
 */
 var Rewriter = module.exports = function Rewriter(server) {
 	this.server = server;
 	this.count = 0;
 };

Rewriter.prototype.calcSpeed = function(){
    if(!!this.lastSyncStartCnt){
        var cosumeCnt = this.lastSyncStartCnt - this.count,
            finishTick;
        if(this.count > 0){
            // 上一轮尚未消化完
            finishTick = Date.now();
        }else{
            finishTick = this.lastSyncFinishTick;
        }
        return (cosumeCnt / ((finishTick - this.lastSyncStartTick) / (60 * 1000)));
    }
    return 0;
};

/**
 * Initiate sync.
 */

 Rewriter.prototype.sync = function(){
 	var self = this,server = self.server, speed = self.calcSpeed();
    if(speed > 0){
        console.log('sync speed = %s req/min', speed);
    }
    if(self.count > 0){
        // 定时同步触发时，上次触发的还未写完
        console.warn('sync late count = %s', self.count);
    }else{
        if(self.lastSyncStartCnt > 0){
            console.log('sync last cost = %s', self.lastSyncFinishTick - self.lastSyncStartTick);
        }
    }

 	server.flushQueue.shiftEach(function(element){
 		self.tick(element.key,element.val);	
 	});
 	var mergerMap = server.mergerMap;  
 	for (var mergerKey in mergerMap){
 		var entry = mergerMap[mergerKey];
 		self.tick(entry.key,entry.val);	
 		delete mergerMap[mergerKey];	
 	}
    var groupByPlayerId = server.groupByPlayerId;
    for(var playerId in groupByPlayerId){
        var group = groupByPlayerId[playerId];
        for(var mergeKey in group){
            var entry = group[mergeKey];
            self.tick(entry.key, entry.val);
            delete group[mergeKey];
        }
        delete groupByPlayerId[playerId];
    }

     self.lastSyncStartCnt = self.count;
     self.lastSyncStartTick = Date.now();
 	return true;
 };

/*
 *
 * flush db
 *
 */
 Rewriter.prototype.flush = function(key, val, cb){
 	this.tick(key, val, cb);
 };
/*
 *
 * judge task is done
 *
 */
 Rewriter.prototype.tick = function(key,val,cb){
 	var self = this,server = self.server;
 	if (!server.client){
 		server.log.error('db sync client is null');
 		return ;
 	}
 	var syncb = server.mapping[key];
 	if (!syncb) {
 		server.log.error('%s callback function not exist ', key);
 		return;
 	}
 	if (!cb) {
 		self.count+=1;
 		return invoke(syncb,server.client,val,function(){
            self.count-=1;
            if(self.count === 0){
                self.lastSyncFinishTick = Date.now();
            }
        });
 	} else {
 		invoke(syncb,server.client,val,cb);
 	}
 };
/*
 *
 * judge task is done
 *
 */
 Rewriter.prototype.isDone = function() {
 	return this.count===0;
 };
