/**
 * 游戏数据基类
 */

var util = require('util');
var _  = require('underscore');

var consts = require('../../consts/consts'),
    Entity = require('./entity'),
    SeatData = require('./SeatData');

var RoomData = function(opts){
    opts.type = consts.ENTITY_TYPE.ROOM;
    Entity.call(this,opts);

    this.createPlayerId = opts.createPlayerId;         //房间创建者id
    this.seatDataList = {};          //座位信息集合, 如果是已经有的房间重新初始化,调用initSeatDataList方法复制
    this.currOutCardPlayerId = this.currOutCardPlayerId || 0;    //当前出牌人id
    this.createTime = opts.createTime || new Date().getTime();             //创建房间的时间,如果不是已经有的房间重新初始化，就默认为创建房间
    this.finshGameCnt = opts.finshGameCnt || 0;           //已完成游戏局数
};

util.inherits(RoomData, Entity);

var pro = RoomData.prototype;

/*
初始化作为集合信息
* */
pro.initSeatDataList = function(seatDatas){
    var _self = this;
    seatDatas.forEach(function(data){
        _self.addSeatData(data);
    })
}

/***新增一个座位数据 */
pro.addSeatData = function( seatData ){
    var seatIndex = seatData.seatIndex;
    var seatData = new SeatData( seatData );
    this.seatDataList[seatIndex] = seatData;
};

/**
 * 通过座位号获取座位信息
 * */
pro.getSeatDataByPlayerId = function ( seatId ) {
    
};


/***刷新一个座位数据 */
pro.refreshSeatData = function(seatData){
    var seatIndex = seatData.seatIndex;
    this.seatDataList[seatIndex].refreshData(seatData);
};


pro.getClientInfo = function(){
    var info = {};
    info.id = this.id;
    info.createPlayerId = this.createPlayerId;
    info.currOutCardPlayerId = this.currOutCardPlayerId;
    info.createTime = this.createTime;
    info.finshGameCnt = this.finshGameCnt;
    //info.seatDataList = _map(this.seatDataList.);//等座位功能完成后再写

    return info;
}

module.exports = RoomData;