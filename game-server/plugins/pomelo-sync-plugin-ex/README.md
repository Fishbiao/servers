pomelo-sync-plugin-ex
==================

sync plugin for pomelo(>=0.6)


Base on [pomelo-sync](https://github.com/NetEase/pomelo-sync) to compose this plugin, you can check the detail information in [here](https://github.com/NetEase/pomelo-sync/blob/master/README.md).

```

#Usage

```
var sync = require('./plugins/pomelo-sync-plugin-ex');

//app.js

app.use(sync, {sync: {
  key1: value1,
  key2: value2
}});

```
