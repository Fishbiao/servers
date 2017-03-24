/**
 * Module dependencies
 */
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
 * Persistent object, it is saved in database
 *
 * @param {Object} opts
 * @api public
 */
var Persistent = function(opts) {
	this.id = opts.id;
	this.type = opts.type;
	EventEmitter.call(this);
};

util.inherits(Persistent, EventEmitter);

var pro = Persistent.prototype;

pro.save = function()
{
	this.emit('save',this.getData());
};

pro.getData = function(){
	return {
		id: this.id
	};
};

pro.flush = function(cb){
	this.emit('flush', cb);
};

module.exports = Persistent;
