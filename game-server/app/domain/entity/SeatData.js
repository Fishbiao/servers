/**
 * 座位数据
 */
var util = require('util');

var _  = require('underscore');

var Entity = require('./entity');

var SeatData = function( data ){
    Entity.call(this);
    this.clearn();    
    this.mSeatData = data;
}

util.inherits(SeatData, Entity);
var pro = SeatData.prototype;
 
/***
 * 初始化座位数据
 * */ 
pro.clearn = function(){ 

    /*=========================公开数据========================*/
    //座位号
    this.seatIndex = -1;  

    //墙牌牌数量
    this.WallCardCnt  = 0;  

    //吃牌数据
    this.eatData = [];  

    //碰牌数据 
    this.pengData = [];  

    //杠牌数据
    this.gangData = [];  

    /*=========================私有数据========================*/
    //手牌数据
    this.handData = [];

};

//================================黄金分割线=================================
/***
 * 设置座位号
 * */  
pro.setSeatIndex = function(seatIndex){
    this.seatIndex = seatIndex;
    return this; 
};

/***
 * 设置吃牌数据
 * */  
pro.setEatData = function(eatData){
    this.eatData = eatData;
    return this;  
};

/***
 * 设置碰牌数据
 * */  
pro.setPengData = function(pengData){
    this.pengData = pengData;
    return this;  
};

/***
 * 设置杠牌数据
 * */  
pro.setGangData = function(gangData){
    this.gangData = gangData;
    return this;  
};

/***
 * 设置手牌数据
 * */  
pro.setHandData = function(handData){
    this.handData = handData;
    return this;  
};

//================================黄金分割线=================================

/***
 * 获取座位号
 * return int；
 * */  
pro.getSeatIndex = function(){
    return  this.seatIndex; 
};

/***
 * 获取碰牌数据
 * return 二维数组；
 * */  
pro.getPengData = function(){
    return  this.pengData; 
};

/***
 * 获取吃牌数据   
 * return 二维数组；
 * */  
pro.getEatData = function(){
    return  this.eatData; 
};

/***
 * 获取杠牌数据
 * return 二维数组；
 * */  
pro.getGangData = function(){
    return  this.gangData; 
};

/***
 * 获取手牌数据
 * return 二维数组；
 * */  
pro.getHandData = function(){
    return  this.handData; 
};  


pro.refreshData = function(data){
    this.mSeatData = data;
}

module.exports = SeatData;