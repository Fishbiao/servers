/**
 * Created by kilua on 14-6-27.
 * 在linux下，用vim编辑被监视文件，第一次会监视到文件变化，后续监视不到，这是由于vim的备份机制导致的，可以用nano进行编辑
 */
var fs = require('fs'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

var Watcher = function(opts){
    this.filename = opts.filename;
    this.encoding = opts.encoding || 'utf-8';
    this.timeout = opts.timeout || 5000;

    if(!fs.existsSync(this.filename)) {
        console.error('file %s not exist!', this.filename);
    }
};

util.inherits(Watcher, EventEmitter);

var pro = Watcher.prototype;

/*
*   @param {callback} cb function(err, data){} as that of fs.readFile.
* */
pro.start = function(cb){
    var self = this;
    if(fs.existsSync(self.filename)){
        //fs.readFile(self.filename, self.encoding, cb);
        try {
            var fileData = fs.readFileSync(self.filename, self.encoding);
            cb(null, fileData);
        }catch (ex) {
            cb(ex.stack, '');
        }

        fs.watch(self.filename, function(event){
//            console.log('event %s', event);
            // cache file change events.
            // current version of fs.watch bug:
            // one file change may trigger two 'change' events.
            if(event === 'change' && !self.cacheTimeout){
                self.cacheTimeout = setTimeout(function(){
                    // clear timeout.
                    self.cacheTimeout = null;
                    // changed, reload
                    // bug fix:
                    // filename relative to application path.
//                    fs.readFile(filename, self.encoding, cb);
                    fs.readFile(self.filename, self.encoding, cb);

                }, self.timeout);
            }
        });
    }else{
        console.error('file %s not exist!', self.filename);
    }
};

module.exports = Watcher;