/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-8-19
 * Time: 下午2:27
 * To change this template use File | Settings | File Templates.
 */

var util = require('util'),
    $ = require('../lib/ansiStylize').$;

function log(){
    util.puts([].join.call(arguments, ' '));
}

// work with util.puts function
log($('hello').green);
log($('world').green.bold);
// can be concated
log($('hello').cyan + $(' world').red);

// not work with console object
console.log($('hello').blue);