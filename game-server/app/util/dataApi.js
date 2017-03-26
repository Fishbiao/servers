/**
 * Created by lishaoshen on 2015/10/9.
 */

var chokidar = require('chokidar');

var loader = require('./loader'),
    parsers = loader.load(__dirname + '/rowParser');

var exp = module.exports = {};
exp.modules = {};
var ready = false;

exp.isReady = function () {
    return ready;
};
/*
 *   目前只Shop和Goods进行动态加载
 *   *其他表如HeroAttribute，如果进行动态加载，由于相关实现缓存了相关数据的引用，将导致旧表的部分数据，由于引用的玩家未下线，而不释放
 * */
var dynamicWhiteDict = {
    "Shop": true,
    "Goods": true,
    "Activity": true,
    "ActivityCond": true,
    "ActivityGoods": true,
    "ActivityNotice": true,
    "ActivetyStrength":true,
    "ActivetyRecharge":true,
    "Recharge": true,
    "InvitCfg": true    //邀请码表
};
var dataPath = require('path').join(__dirname, '../../config/data');
chokidar.watch(dataPath, {ignored: /[\/\\]\./, persistent: true})
    .on('add', function (filename) {
        var name = loader.getFileName(filename, '.json'.length);
        //console.log('add design data %s', name);
        Object.defineProperty(exp, name, {
            get: (function (name) {
                return function () {
                    var mod = this.modules[name];
                    if (!mod && !!parsers[name]) {
                        mod = this.modules[name] = parsers[name](loader.loadFile(filename));
                        console.log('add design data [%s] load ok!', name);
                    }
                    return mod;
                }
            })(name)
        });
    })
    .on('change', function (filename) {
        var name = loader.getFileName(filename, '.json'.length),
            tableObj = exp.modules[name];
        if (!!dynamicWhiteDict[name] && tableObj) {
            var tableObj = exp.modules[name];
            tableObj.reload(loader.loadFile(filename));
            tableObj.emit('change');
            console.log('change design data [%s] reload ok!', name);
        }
    })
    .on('error', function (error) {
        console.error('watch %s err %s', dataPath, error);
    })
    .on('ready', function () {
        console.info('design data ready!');
        ready = true;
    });
