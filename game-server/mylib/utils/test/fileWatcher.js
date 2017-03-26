/**
 * Created by kilua on 14-6-27.
 */

var Watcher = require('../lib/fileWatcher');

var testWatcher = new Watcher({filename: './test.txt', encoding: 'utf-8'});

testWatcher.start(function(err, data){
    if(err){
        console.error('err = %s', err.stack);
    }else{
        console.log('flush file content:\r\n%s', data);
    }
});
