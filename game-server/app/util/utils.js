/**
 * Created by lishaoshen on 2015/09/28.
 */

var utils = module.exports;
var Consts = require('./../consts/consts')
// control variable of func "myPrint"
var isPrintFlag = false;
// var isPrintFlag = true;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function (cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * clone an object
 */
utils.clone = function (origin) {
    if (!origin) {
        return;
    }

    var obj = {};
    for (var f in origin) {
        if (origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};

utils.size = function (obj) {
    if (!obj) {
        return 0;
    }

    var size = 0;
    for (var f in obj) {
        if (obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};

// print the file name and the line number ~ begin
function getStack() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

function getFileName(stack) {
    return stack[1].getFileName();
}

function getLineNumber(stack) {
    return stack[1].getLineNumber();
}

utils.myPrint = function () {
    if (isPrintFlag) {
        var len = arguments.length;
        if (len <= 0) {
            return;
        }
        var stack = getStack();
        var aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
        for (var i = 0; i < len; ++i) {
            aimStr += arguments[i] + ' ';
        }
        console.log('\n' + aimStr);
    }
};

/*
 *  拆分字符串，并生成数组，如果有元素是数值，则自动转成Number
 * * */
utils.parseParams = function (paramStr, splitChar) {
    var _ = require('underscore');
    var params = [];
    if (paramStr) {
        if (_.isString(paramStr)) {
            var tmp = paramStr.split(splitChar);
            _.each(tmp, function (elem) {
                var num = Number(elem);
                if (!_.isNaN(num)) {
                    params.push(num);
                } else {
                    params.push(elem);
                }
            });
        } else {
            params.push(paramStr);
        }
    }
    return params;
};

/*
 *   将指定时间推前或推后指定个周
 *   @param {Date}   now 此函数直接修改此参数
 *   @param {Number} weekDiff 可为任意正负整数或0
 *   @return {Date}  返回修改后的时间
 * */
utils.getWeeksFrom = function (now, weekDiff) {
    var millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    now.setTime(now.getTime() + weekDiff * millisecondsPerWeek);
    return now;
};

var getDomLimit = utils.getDomLimit = function (year, month) {
    // month这个月月底
    var date = new Date(year, month + 1, 0);
    return date.getDate();
};
/*
 *   将指定时间推前或推后指定个月,月份必定改变monthDiff,日期一般是对应的，但有例外，例如5-31，往前调1个月就是4-30
 *   @param {Date}   now 此函数直接修改此参数
 *   @param {Number} monthDiff 可为任意正负整数或0
 *   @return {Date}  返回修改后的时间
 * */
utils.getMonthsFrom = function (now, monthDiff) {
    var fromDate = now.getDate();
    now.setDate(1);
    now.setMonth(now.getMonth() + monthDiff);
    now.setDate(Math.min(fromDate, getDomLimit(now.getFullYear(), now.getMonth())));
    return now;
};

/*
* 本周的开始时间 （星期一的0点）
* */
utils.thisWeekBeginTime = function () {
    var nowTime = new Date(Date.now());
    var todayBeginTime = new Date( nowTime.getFullYear() , nowTime.getMonth() , nowTime.getDate() );
    //星期几
    var nDay = nowTime.getDay();
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    var time = todayBeginTime - (nDay -1)* millisecondsPerDay;
    return time;
};

utils.daysBetween = function (fromDate, toDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);
    return Math.floor(Math.abs(fromDate.getTime() - toDate.getTime()) / millisecondsPerDay);
};

var RESOLUTION = 0.00000001;
/*
 *   Check if two float numbers is equal.
 * */
utils.almostEqualRelativeOrAbsolute = function (a, b, maxRelativeError, maxAbsoluteError) {
    if (!maxAbsoluteError) {
        maxAbsoluteError = RESOLUTION;
    }
    if (!maxRelativeError) {
        maxRelativeError = RESOLUTION;
    }
    if (Math.abs(a - b) < maxAbsoluteError) {
        return true;
    }
    var relativeError;
    if (Math.abs(b) > Math.abs(a)) {
        relativeError = Math.abs((a - b) / b);
    } else {
        relativeError = Math.abs((a - b) / a);
    }
    return (relativeError <= maxRelativeError);
};
/*
*  是否为同一天
*  */
utils.isSameDay=function( time1 , time2 )
{
    var time1Temp = new Date(time1);
    var time2Temp = new Date(time2);
    return time1Temp.getYear() == time2Temp.getYear() && time1Temp.getMonth() == time2Temp.getMonth() && time1Temp.getDay() == time2Temp.getDay();
};

/*
*  大小周 参照时间1970年1月1日 为小周 依次类推 （小周大周即单双周）
*  返回true为大周 false为小周
*  */
utils.getWeekType = function()
{
    var currTime = Date.now();
    var sec = Math.floor( currTime * 0.001 ) - utils.getServerInitTime() ;
    var tempWeek =  sec / utils.getOneWeekSecs();
    var totalWeek = Math.ceil(tempWeek);
    return totalWeek % 2 == 0;
};

/* 1451836800 为2016年1月4日0时0分 为第一周 （单周）
 * 单位：秒
 * */
utils.getServerInitTime=function()
{
    return  1451836800;
};
/* 获取一周的秒数
 * 单位：秒
 * */
utils.getOneWeekSecs=function()
{
    return 604800;
};

/* 获取一周的毫秒
 * 单位：秒
 * */
utils.getOneWeekMillisecond=function()
{
    return 604800000;
};

/*获取本周的第一天的起始时间轴
* 单位：秒
* */
utils.getCurrWeekStartTime=function()
{
    var currTime = Date.now();
    var sec = Math.floor( currTime * 0.001 ) - utils.getServerInitTime() ;
    var tempWeek =  sec /  utils.getOneWeekSecs();
    var totalWeek = Math.floor(tempWeek);
    return utils.getServerInitTime() + totalWeek * utils.getOneWeekSecs();
};

utils.getDataString = function(time)
{
    time = time || Date.now();
    var d = new Date( time );
    var tmp = d.getUTCFullYear() + '-' + (d.getMonth()+1) +'-'+ d.getDate();
    return tmp;
};

utils.getLengthInBytes = function(str) {
    var b = str.match(/[^\x00-\xff]/g);
    return (str.length + (!b ? 0: b.length));
};