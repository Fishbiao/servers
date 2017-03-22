/**
 * Created by fisher on 2017/3/21.管理定时任务。将各个Crons.json中配置的定时任务放到triggers里面，方便调用。
 */
var cronTrigger = require('../domain/area/cronTrigger');

var exp = module.exports = {};

function loadCronTriggers(app){
    var crons = app.get('crons'),
        cronsList, i, cron, trigger,
        triggers = {};
    if(!!crons){
        cronsList = crons[app.serverType];
        //console.log(cronsList);
        if(!!cronsList){
            for(i = 0; i < cronsList.length; ++i){
                cron = cronsList[i];
                trigger = cronTrigger.createTrigger(cron.time);
                trigger.args = cron.args;
                triggers[cron.id] = trigger;
            }
        }
    }
    return triggers;
}

var CronTriggerManager = function(app){
    this.app = app;
    this.triggers = loadCronTriggers(app);
};

CronTriggerManager.prototype.getTriggerById = function(cronId){
    if(!!this.triggers){
        return this.triggers[cronId];
    }
    return null;
};

exp.init = function(app){
    return new CronTriggerManager(app);
};
