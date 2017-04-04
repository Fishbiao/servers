/**
 * Created by Administrator on 2016/3/25 0025.
 */

var util = require('util');

var IndexData = require('../jsonTable'),
    utils = require('../utils');

var PkConfig = function (data) {
    IndexData.call(this, data);
};

util.inherits(PkConfig, IndexData);

var pro = PkConfig.prototype;

pro.rowParser = function (row) {
    return row;
};

pro.getPrimaryKey = function () {
    return 'id';
};

//获取扑克配置表的长度
pro.getLength = function(){
    return this.dataLength;
}

//获取非大小王牌的id
pro.getIdsWithoutKing = function(cb){
    for(var i in this.data){
        if(this.data[i].cardType != 5){
            cb(this.data[i].id);
        }
    }
}

module.exports = function (data) {
    return new PkConfig(data);
};