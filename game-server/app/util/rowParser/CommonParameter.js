/**
 * Created by Administrator on 2016/3/25 0025.
 */

var util = require('util');

var IndexData = require('../jsonTable'),
    utils = require('../utils');

var CommonParameter = function (data) {
    IndexData.call(this, data);
};

util.inherits(CommonParameter, IndexData);

var pro = CommonParameter.prototype;

pro.rowParser = function (row) {
    return row;
};

pro.getPrimaryKey = function () {
    return 'id';
};

/*
 *   读取参数表的指定参数值
 * */
pro.getOptionValue = function (optionId, defVal) {
    var optionData = this.findById(optionId);
    if (optionData) {
        return optionData.value || defVal;
    }
    return defVal;
};

/*
 *   读取参数表的指定的数组型参数中的指定元素
 * */
pro.getOptionListValueByIndex = function (optionId, idx, splitChar) {
    var optionData = this.findById(optionId),
        listStr = optionData ? optionData.value : '',
        listNums = utils.parseParams(listStr, splitChar || '#');
    return listNums[Math.min(idx, listNums.length - 1)];
};

/*
 *   读取参数表中的指定的数组型参数
 * */
pro.getOptionList = function (optionId, splitChar) {
    var optionData = this.findById(optionId),
        listStr = optionData ? optionData.value : '';
    return utils.parseParams(listStr, splitChar || '#');
};

module.exports = function (data) {
    return new CommonParameter(data);
};