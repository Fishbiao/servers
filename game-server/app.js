var pomelo = require('pomelo');

/**
 * Init app for client.
 */
var app = pomelo.createApp();

var cronTriggerManager = require('./app/util/cronTriggerManager');

app.set('name', 'servers');

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
