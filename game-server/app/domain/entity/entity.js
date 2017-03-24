/**
 * Created by employee11 on 2015/12/11.
 */

// dependencies.
var util = require('util');

//var _ = require('underscore');

var Persistent = require('../persistent');
var EVENTS = require('../event/events');
var _ = require('underscore');

var id = 1;

/**
 * Initialize a new 'Entity' with the given 'opts'.
 * Entity inherits EventEmitter
 *
 * @param {Object} opts
 * @api public
 */
var Entity = function(opts){
    Persistent.call(this, opts);

    this.entityId = id++;
    this.type = opts.type;
    this.areaId = opts.areaId;
};

util.inherits(Entity, Persistent);

var pro = Entity.prototype;

pro.set = function(prop, value){
    if(!_.has(this, prop)){
        return;
    }
    if(this[prop] === value){
        return;
    }
    this[prop] = value;
    this.emit(EVENTS.UPDATE_PROP, prop, value, this);
};

/**
 * Get entityId
 *
 * @return {Number}
 * @api public
 */
pro.getEntityId = function() {
    return this.entityId;
};

pro.getAreaId = function(){
    return this.areaId;
};

pro.getData = function(){
    var data = {},
        parentData = Persistent.prototype.getData.call(this);
    for(var prop in parentData){
        if(parentData.hasOwnProperty(prop)) {
            data[prop] = parentData[prop];
        }
    }
    return data;
};


module.exports = Entity;