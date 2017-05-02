/**
 * Created with JetBrains WebStorm.
 * User: WIN 7
 * Date: 13-3-22
 * Time: 下午1:58
 * To change this template use File | Settings | File Templates.
 */

/*jshint bitwise: false*/

var querystring = require('querystring');
var utils = module.exports;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb) {
    if(!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/*
*   深度递归复制对象，并且包括方法
* */
utils.deepClone = function(p){
    if(!p){
        return null;
    }

    var o = p.constructor === Array ? [] : {},
        e, subObj;
    for(e in p){
        if((!(p instanceof Array) && p.hasOwnProperty(e)) || (p instanceof Array)) {
            subObj = p[e];
            if (subObj === "object") {
                o[e] = utils.deepClone(subObj);
            } else {
                o[e] = subObj;
            }
        }
    }
    return o;
};

/**
 * clone an object
 */
utils.clone = function(origin) {
    if(!origin) {
        return;
    }

    var obj = {}, f;
    for(f in origin) {
        if(origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};

/**
 * append all properties from object src to object dst without traversing its proto train.
 */
utils.append = function(dst, src, override){
    if(!src || !dst){
        return;
    }
    var prop;
    for(prop in src){
        if(src.hasOwnProperty(prop)){
            if(override){
                dst[prop] = src[prop];
            }else{
                if(!dst.hasOwnProperty(prop)){
                    dst[prop] = src[prop];
                }
            }
        }
    }
};

utils.clonePartial = function(src, dest, includes) {
    var f, i, l;
    for(i = 0, l = includes.length; i < l; i++) {
        f = includes[i];
        dest[f] = src[f];
    }
};

utils.size = function(obj) {
    if(!obj) {
        return 0;
    }

    var size = 0, f;
    for(f in obj) {
        if(obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};

/**
 * String formatting util function.
 *
 * @return {String} the formmatted string.
 *  Example:
 *  console.log(format('%1 = %2', 'name', 'Kilua'));
 */
utils.format = function(s){
    var args = arguments;
    var pattern = new RegExp("%([1-" + args.length + "])","g");
    return String(s).replace(pattern,function(word,index){
        return args[index];
    });
};

/**
 * Strip white-space character on both end of a string.
 *
 * @param {String} s source string.
 * @return {String} the result string.
 *  Example:
 *  console.log(trim('      Kilua          '));
 */
utils.trim = function(s){
    return s.replace(/(^\s*)|(\s*$)/g, "");
};

utils.getChance = function(percent){
    return (Math.random() < percent);
};

utils.randomRange = function(range){
    return Math.floor(Math.random() * range);
};

utils.randomElem = function(list){
    var index = utils.randomRange(list.length);
    return list[index];
};

utils.strTimes = function(s, n) {
    var total = "";
    while(n > 0) {
        if (n % 2 === 1){
            total += s;
        }
        if (n === 1){
            break;
        }
        s += s;
        n = n>>1;
    }
    return total;
};

function encode_utf8( s )
{
    return querystring.unescape( encodeURIComponent( s ) );
}

utils.substr_utf8_bytes = function(str, startInBytes, lengthInBytes) {

    /* this function scans a multibyte string and returns a substring.
     * arguments are start position and length, both defined in bytes.
     *
     * this is tricky, because javascript only allows character level
     * and not byte level access on strings. Also, all strings are stored
     * in utf-16 internally - so we need to convert characters to utf-8
     * to detect their length in utf-8 encoding.
     *
     * the startInBytes and lengthInBytes parameters are based on byte
     * positions in a utf-8 encoded string.
     * in utf-8, for example:
     *       "a" is 1 byte,
     "ü" is 2 byte,
     and  "你" is 3 byte.
     *
     * NOTE:
     * according to ECMAScript 262 all strings are stored as a sequence
     * of 16-bit characters. so we need a encode_utf8() function to safely
     * detect the length our character would have in a utf8 representation.
     *
     * http://www.ecma-international.org/publications/files/ecma-st/ECMA-262.pdf
     * see "4.3.16 String Value":
     * > Although each value usually represents a single 16-bit unit of
     * > UTF-16 text, the language does not place any restrictions or
     * > requirements on the values except that they be 16-bit unsigned
     * > integers.
     */

    var resultStr = '';
    var startInChars = 0;

    // scan string forward to find index of first character
    // (convert start position in byte to start position in characters)
    var bytePos, ch, end;
    for (bytePos = 0; bytePos < startInBytes; startInChars++) {

        // get numeric code of character (is >128 for multibyte character)
        // and increase "bytePos" for each byte of the character sequence

        ch = str.charCodeAt(startInChars);
        bytePos += (ch < 128) ? 1 : encode_utf8(str[startInChars]).length;
    }

    // now that we have the position of the starting character,
    // we can built the resulting substring

    // as we don't know the end position in chars yet, we start with a mix of
    // chars and bytes. we decrease "end" by the byte count of each selected
    // character to end up in the right position
    // be sure not to exceed source string length.
    end = Math.min(startInChars + lengthInBytes - 1, str.length - 1);
    var n;
    for (n = startInChars; startInChars <= end; n++) {
        // get numeric code of character (is >128 for multibyte character)
        // and decrease "end" for each byte of the character sequence
        ch = str.charCodeAt(n);
        end -= (ch < 128) ? 1 : encode_utf8(str[n]).length;

        resultStr += str[n];
    }

    return resultStr;
};

utils.getLengthInBytes = function(str) {
    var b = str.match(/[^\x00-\xff]/g);
    return (str.length + (!b ? 0: b.length));
};

var RESOLUTION = 0.00000001;
/*
*   Check if two float numbers is equal.
* */
utils.almostEqualRelativeOrAbsolute = function(a, b, maxRelativeError, maxAbsoluteError){
    if(!maxAbsoluteError){
        maxAbsoluteError = RESOLUTION;
    }
    if(!maxRelativeError){
        maxRelativeError = RESOLUTION;
    }
    if(Math.abs(a - b) < maxAbsoluteError){
        return true;
    }
    var relativeError;
    if(Math.abs(b) > Math.abs(a)){
        relativeError = Math.abs((a - b) / b);
    }else{
        relativeError = Math.abs((a - b) / a);
    }
    return (relativeError <= maxRelativeError);
};

utils.capitalize = function(str){
    if(str === ''){
        return '';
    }
    return str[0].toUpperCase() + str.substring(1);
};

/*
*	串行深度优先遍历目录树
*/
utils.walk = function(dir, done){
	var fs = require('fs');
	var results = [];
    fs.readdir(dir, function(err, list){
        if (err){return done(err);}
        var i = 0;
        (function next() {
            var file = list[i++];
            if(!file){ return done(null, results);}
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    utils.walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

/**
 * export closure function out
 *
 * @param {Object} outer outer function
 * @param {Object} inner inner function
 * @param {String} event
 * @api private
 */
utils.exportEvent = function(outer, inner, event) {
    inner.on(event, function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(event);
        outer.emit.apply(outer, args);
    });
};

/*
*   listen on event and trigger newEvent
* */
utils.chainEvent = function(outer, outerEvent, inner, innerEvent){
    inner.on(innerEvent, function(){
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(outerEvent);
        outer.emit.apply(outer, args);
    });
};

utils.getLocalIPs = function() {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    var ips = [];
    var func = function(details) {
        if (details.family === 'IPv4') {
            ips.push(details.address);
        }
    };

    for (var dev in ifaces) {
        ifaces[dev].forEach(func);
    }
    return ips;
};

utils.daysBetween = function(fromDate, toDate){
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);
    return Math.floor(Math.abs(fromDate.getTime() - toDate.getTime()) / millisecondsPerDay);
};

var getDomLimit = utils.getDomLimit = function(year, month){
    // month这个月月底
    var date = new Date(year, month+1, 0);

    return date.getDate();
};

/*
 *   将指定时间推前或推后指定个月,月份必定改变monthDiff,日期一般是对应的，但有例外，例如5-31，往前调1个月就是4-30
 *   @param {Date}   now 此函数直接修改此参数
 *   @param {Number} 可为任意正负整数或0
 *   @return {Date}  返回修改后的时间
 * */
utils.getMonthsFrom = function(now, monthDiff){
    var fromDate = now.getDate();
    now.setDate(1);
    now.setMonth(now.getMonth() + monthDiff);
    now.setDate(Math.min(fromDate, getDomLimit(now.getFullYear(), now.getMonth())));
    return now;
};

/*
 *   将指定时间推前或推后指定个周
 *   @param {Date}   now 此函数直接修改此参数
 *   @param {Number} 可为任意正负整数或0
 *   @return {Date}  返回修改后的时间
 * */
utils.getWeeksFrom = function(now, weekDiff){
    var millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    now.setTime(now.getTime() + weekDiff * millisecondsPerWeek);
    return now;
};

/*
*   将指定时间推前或推后指定天
*   @param {Date}   now 此函数直接修改此参数
*   @param {Number} dayDiff 可为任意正负整数或0
*   @return {Date}  返回修改后的时间
* */
utils.getDaysFrom = function(now, dayDiff){
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    now.setTime(now.getTime() + dayDiff * millisecondsPerDay);
    return now;
};