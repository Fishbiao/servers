/**
 * Created by Administrator on 2015/4/21.
 */

var everyAuth = require('./index'),
    authConfig = require('./config/auth.json');

var thirdParty = '4399';
var appInfo = authConfig[thirdParty];

var uid = '1579517763',
    state = '1579517763|2e90a84ccc358d5950f7c4b0ca885dcf|40027|99000567865587|e21df821cb5494fdc22b9774c6737ffe|e106d82a47839e45502a85e0987de49d|1430904220|4399';
everyAuth['4399'].authCheck(appInfo.appId, appInfo.appSecret, uid, state, function(pass){
    console.log('oauthCheck ' + pass);
});
