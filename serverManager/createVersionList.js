/**
 * Created by kilua on 2014-12-12.
 */

var fs = require('fs'),
    path = require('path'),
    util = require('util');

var exp = module.exports = {};

/*
 *   遍历目录，获取文件列表
 *   @param {String} dir 待遍历的目录
 *   @param {Object} opts 选项，包括recursive和ext,分别用于指定是否递归和目标扩展名，默认不递归，无过滤扩展名
 *   @param {callback} done
 * */
var walk = function (dir, opts, done) {
    opts = opts || {};
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) {
            return done(err);
        }
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) {
                return done(null, results);
            }
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && !!opts.recursive && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    if (!!opts.ext && path.extname(file) !== opts.ext) {
                        return next();
                    }
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

function extractVersion(versionStr) {
    var parts = versionStr.split('#'),
        version = '';
    if (parts.length > 0) {
        version = parts[0];
    }
    return version;
}

function versionSub(a, b) {
    var partsA = a.split('.'),
        partsB = b.split('.'),
        i, diff;
    for (i = 0; i < partsA.length; ++i) {
        diff = parseInt(partsA[i]) - parseInt(partsB[i]);
        if (diff === 0) {
            continue;
        }
        return diff;
    }
    return 0;
}

function sortVersion(a, b) {
    var versionA = extractVersion(a),
        versionB = extractVersion(b);
    //console.log('%s - %s = %s', a, b, versionSub(versionA, versionB));
    return versionSub(versionA, versionB);
}

exp.create = function (dir, ext, outFileName, cb) {
    walk(dir, {ext: ext}, function (err, files) {
        if (err) {
            return cb(err);
        }
        console.log('files = %j', files);
        var versionList = [];
        files.forEach(function (filename, idx) {
            fs.stat(filename, function (err, stats) {
                if (err) {
                    return cb(err);
                }
                var basename = path.basename(filename),
                    version = basename.replace(ext, ''),
                    versionStr;
                console.log('version = %s, size = %s', version, stats.size);
                versionList.push(util.format('%s#%s&', version, stats.size));
                // 必须保证版本和文件数一致，才返回。否则在linux上有可能因为某个包比较大，导致版本信息还未添加完就回调出去了
                if (versionList.length === files.length) {
                    // last file
                    versionList.sort(sortVersion);
                    console.log('versionList = %j', versionList);
                    versionStr = JSON.stringify(versionList);
                    fs.writeFileSync(outFileName, versionStr, {encoding: "utf-8"});
                    cb();
                }
            });
        });
        if (files.length === 0) {
            fs.writeFileSync(outFileName, JSON.stringify(versionList), {encoding: "utf-8"});
            cb();
        }
    });
};

exp.cmpVersion = function (a, b) {
    var versionA = extractVersion(a),
        versionB = extractVersion(b);
    return versionSub(versionA, versionB);
};

exp.extractPkgName = function (filename, ext) {
    return path.basename(filename).replace(ext, '')
};