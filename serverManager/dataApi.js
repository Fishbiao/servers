/**
 * Created by kilua on 2015-10-18.
 */

var _ = require('underscore');

var utils = require('./mylib/utils/lib/utils');

var exp = module.exports = {};

/**
 * map the array data to object
 *
 * @param {Object}  fields
 * @param {Array}   item
 * @return {Object} result
 * @api private
 */
var mapData = function (fields, item) {
    var obj = {}, fieldName;
    for (fieldName in fields) {
        if (fields.hasOwnProperty(fieldName)) {
            obj[fieldName] = item[fields[fieldName]];
            //console.log(k + ' = ' + item[fields[k]]);
        }
    }
    return obj;
};

/**
 * Data model `new Data()`
 *
 * @param {Array} data
 * @param {Function} rowParser function to parse row data if any.
 */
var Data = function (data, rowParser) {
    var fields = {};
    data[1].forEach(function (fieldName, fieldIndex) {
        fields[fieldName] = fieldIndex;
    });
    data.splice(0, 2);

    var result = [];
    data.forEach(function (dataRow) {
        rowParser = rowParser || _.identity;
        result.push(rowParser(mapData(fields, dataRow)));
    });
    this.data = result;
};

/**
 * find items by attribute
 * CAUTION: the return value is an array!!!
 *
 * @param {String} attr             attribute name
 * @param {String|Number}   value   the value of the attribute
 * @return {Array}          result
 * @api public
 */
Data.prototype.findBy = function (attr, value) {
    var result = [];
    //console.log(' findBy ' + attr + '  value:' + value + '  index: ' + index);
    this.data.forEach(function (k) {
        if (k[attr] === value) {
            k = utils.clone(k);
            result.push(k);
        }
    });
    return result;
};

/**
 * find item by id
 *
 * @param id
 * @return {Object}
 * @api public
 */
Data.prototype.findById = function (id) {
    // for now, return a copy to avoid modification to the data.
    var result;

    for (var i = 0, l = this.data.length; i < l; i++) {
        if (this.data[i].id === id || this.data[i].ID === id) {
            result = utils.clone(this.data[i]);
            break;
        }
    }

    return result;
};

Data.prototype.forEach = function (cb) {
    if (this.data instanceof Array) {
        this.data.forEach(cb);
    } else {
        var key;
        for (key in this.data) {
            if (this.data.hasOwnProperty(key)) {
                cb(this.data[key]);
            }
        }
    }
};
/**
 * find all item
 *
 * @return {Object}
 * @api public
 */
Data.prototype.all = function () {
    // for now, return a copy to avoid modification to the data.
    return utils.clone(this.data);
};

function cloneArray(arr) {
    var another = [];
    arr.forEach(function (elem) {
        another.push(utils.clone(elem));
    });
    return another;
}

/*
 *   查找指定属性值不小于指定值的行
 * */
Data.prototype.findBigger = function (attr, val) {
    return cloneArray(_.filter(this.data, function (row) {
        return row[attr] >= val;
    }));
};

/*
 *   查找指定属性值不大于指定值的行
 * */
Data.prototype.findSmaller = function (attr, val) {
    return cloneArray(_.filter(this.data, function (row) {
        return row[attr] <= val;
    }));
};

/*
 *   查找指定属性所在的区间
 * */
Data.prototype.findZoneBy = function (attr, val) {
    var i, row, result = [];

    // 必须先排序，以提高效率
    if (!this.sorted) {
        // 按待查属性升序排列
        this.data.sort(function (a, b) {
            return (a[attr] - b[attr]);
        });
        this.sorted = true;
    }
    // 表没有数据
    if (this.data.length <= 0) {
        return [];
    }
    // 只一行
    if (this.data.length === 1) {
        return cloneArray([this.data[0], this.data[0]]);
    }
    // 2行及以上
    for (i = 0; i < this.data.length; ++i) {
        row = this.data[i];
        if (Number(row[attr]) >= Number(val)) {
            if (i > 0) {
                result.push(this.data[i - 1]);
                result.push(row);
            } else {
                result.push(row);
                result.push(this.data[i + 1]);
            }
            return cloneArray(result);
        }
    }
    // 爆表的情况,取最后一行
    result.push(this.data[this.data.length - 1]);
    result.push(this.data[this.data.length - 1]);
    return cloneArray(result);
};
//exp.PlatformConfig = new Data(require('../game-server/config/data/PlatformConfig'));
//exp.rechargeCfg = new Data(require('../game-server/config/data/Recharge'));
