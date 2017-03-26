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
log($('green').green);
log($('bold').green.bold);
// can be concated
log($('cyan').cyan + $(' red').red);

// not work with console object
console.log($('blue').blue);