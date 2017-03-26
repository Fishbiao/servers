var pomelo = require('pomelo');

/**
 * Init app for client.
 */
var app = pomelo.createApp();

var cronTriggerManager = require('./app/util/cronTriggerManager');

app.set('name', 'servers');

function decrypt(cyphertext) {
    return new Buffer(cyphertext, 'base64').toString();
}

function decryptDBConfig(mysqlConfig) {
    mysqlConfig.password = decrypt(mysqlConfig.password);
    return mysqlConfig;
}

function configUserDB(app) {
    var dbClient = require('./app/dao/mysql/mysql').init(decryptDBConfig(app.get('mysql').GameUser));
    app.set('dbclient', dbClient);
    if (app.serverType === 'area') {
        // area server启用同步模块,默认同步间隔1分钟
        app.use(require('./plugins/pomelo-sync-plugin-ex'), {
            sync: {
                path: __dirname + '/app/dao/mapping',
                dbclient: dbClient
            }
        });
    }
}

function configMysql(app) {
    app.loadConfig('mysql', app.getBase() + '/config/mysql.json');
    configUserDB(app);
    // 统计库配置
    //configStatDB(app);
    //configLogDB(app);
}

app.configure('production|development', 'area|connector|gate|world', function () {
    configMysql(app);
});

// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3*60*1000,//毫秒
      useDict : true,
      useProtobuf : true
    });
});

app.configure('production|development', 'gate', function () {
    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector//,
            //useProtobuf : true
        });
});

// start app
app.start(function (err) {
    if (err) {
        return;
    }
    app.configure('production|development', function () {
        var cronManager = cronTriggerManager.init(app);
        app.set('cronManager', cronManager);
    });

});

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
