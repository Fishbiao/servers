/**
 * Created by Administrator on 2016/3/10 0010.
 */

var _ = require('underscore');

var dataApi = require('./dataApi'),
    Consts = require('./../consts/consts'),
    utils = require('./utils');

var exp = module.exports = {};
/*
* strGroup：字符串数组 （比如0.2#0.2#0.3）
* value：0.1
* 通过value值计算value处在strGroup哪个区间
* 数组下标
* */
exp.getIndexByGroup = function( strGroup , value )
{
    var listNums = utils.parseParams( strGroup, '#');
    var tempBf = 0;
    var tempAf = 0;
     var length = listNums.length;
    for( var i =0 ; i <length;++i )
    {
        var num = listNums[i];
        tempAf+=num;
        if(value>=tempBf && value<=tempAf)
        {
            return i+1;
        }
        tempBf=tempAf;
    }
    return 1;
};

/*
 *   读取参数表的指定参数值
 * */
exp.getOptionValue = function (optionId, defVal) {
    return dataApi.CommonParameter.getOptionValue(optionId, defVal);
};

/*
 *   读取参数表的指定的数组型参数中的指定元素
 * */
exp.getOptionListValueByIndex = function (optionId, idx, splitChar) {
    return dataApi.CommonParameter.getOptionListValueByIndex(optionId, idx, splitChar);
};

/*
 *   读取参数表中的指定的数组型参数
 * */
exp.getOptionList = function (optionId, splitChar) {
    return dataApi.CommonParameter.getOptionList(optionId, splitChar);
};

exp.getLanguage = function () {
    var language = dataApi.CommonParameter.getOptionValue('language','');
    return language;
};

