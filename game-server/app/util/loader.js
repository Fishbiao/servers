var fs = require('fs'),
    path = require('path');

var isDir = function (path) {
    return fs.statSync(path).isDirectory();
};

var isFile = function (path) {
    return fs.statSync(path).isFile();
};

/**
 * Check file suffix

 * @param fn {String} file name
 * @param suffix {String} suffix string, such as .js, etc.
 */
var checkFileType = function (fn, suffix) {
    if (suffix.charAt(0) !== '.') {
        suffix = '.' + suffix;
    }

    if (fn.length <= suffix.length) {
        return false;
    }

    var str = fn.substring(fn.length - suffix.length).toLowerCase();
    suffix = suffix.toLowerCase();
    return str === suffix;
};

var requireUncached = function (module) {
    delete require.cache[require.resolve(module)]
    return require(module);
};

var loadFile = module.exports.loadFile = function (fp, context) {
    var m = requireUncached(fp);

    //if(!m) {
    //    return;
    //}

    //if(typeof m === 'function') {
    //    // if the module provides a factory function
    //    // then invoke it to get a instance
    //    m = m(context);
    //}

    return m;
};

var getFileName = module.exports.getFileName = function (fp, suffixLength) {
    var fn = path.basename(fp);
    if (fn.length > suffixLength) {
        return fn.substring(0, fn.length - suffixLength);
    }

    return fn;
};

var loadPath = function (path, context) {
    var files = fs.readdirSync(path);
    if (files.length === 0) {
        console.warn('path is empty, path:' + path);
        return;
    }

    if (path.charAt(path.length - 1) !== '/') {
        path += '/';
    }

    var fp, fn, m, res = {};
    for (var i = 0, l = files.length; i < l; i++) {
        fn = files[i];
        fp = path + fn;

        if (!isFile(fp) || (!checkFileType(fn, '.js') && !checkFileType(fn, '.json'))) {
            // only load js and json file type
            continue;
        }

        m = loadFile(fp, context);

        if (!m) {
            continue;
        }
        var name;
        if (checkFileType(fn, '.js')) {
            name = m.name || getFileName(fn, '.js'.length);
        } else {
            name = getFileName(fn, '.json'.length);
        }
        res[name] = m;
    }

    return res;
};

module.exports.load = function (mpath, context) {
    if (!mpath) {
        throw new Error('opts or opts.path should not be empty.');
    }
    try {
        mpath = fs.realpathSync(mpath);
    } catch (err) {
        throw err;
    }
    if (!isDir(mpath)) {
        throw new Error('path should be directory.');
    }
    return loadPath(mpath, context);
};