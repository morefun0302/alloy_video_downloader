
initApplicationCoins();

function initApplicationCoins() {
    var base_url = 'http://s192325.gridserver.com/udownloader/ios';
    // update or register user device to retrieve the coins
    var url = base_url + "/register.php?udid=" + Ti.App.Properties.getString('userID');
    Ti.API.log('initApplicationCoins' + url);

    var client = Ti.Network.createHTTPClient({
        onload : function(e) {
            var res = JSON.parse(this.responseText);
            if (Ti.Platform.name === 'iPhone OS'){
                $.navQty.text = res.coins;
            }
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {},
        timeout : 5000
    });
    client.open("GET", url);
    client.send();
}
var fields = ['youTubeProvider', 'dailyMotionProvider'];
var win = $.tabSetting;
var rate = Alloy.Globals.Rate;
var TU = require ('TitanUp');

// RATE APP
Alloy.Globals.Rate = require('RateMe');
// detect application settings
win.addEventListener('focus', function (e) {
    // Iterate each property
    _.each(fields, function(value, id) {
        // be carefull with the order of elements from the view
        switch(id){
            case 0:
                $.youTubeSwitch.value = Ti.App.Properties.getBool(value, false);
            break;
            case 1:
                $.dailySwitch.value = Ti.App.Properties.getBool(value, false);
            break;
        }

    });
});

// youtube switch
$.youTubeSwitch.addEventListener('change',function(_event){
    Ti.App.Properties.setBool('settingsChange', true);
    Ti.App.Properties.setBool('youTubeProvider', _event.value);
});

// dailyMotion switch
$.dailySwitch.addEventListener('change',function(_event){
    Ti.App.Properties.setBool('settingsChange', true);
    Ti.App.Properties.setBool('dailyMotionProvider', _event.value);
});

$.rowBtnRate.addEventListener('click', function(){
    rate.open();
});
// Open purchase view
var etBuy = new TU.UI.EventThrottle();
$.rowBtnBuy.addEventListener('click', function(){
    // Let's handle multiple events
    if (!etBuy.shouldFire()){
        return;
    }
    // hook for the purchase window
    Alloy.createController('purchase', {
        eventThrottle: etBuy
    }).getView().open();
});
// Open offerwall view
$.rowBtnEarn.addEventListener('click', function() {
    var offerwall = require('offerwall');
    offerwall.show();
});
// Open buy/earn view
// avoid multiple events
var et = new TU.UI.EventThrottle();
if (Ti.Platform.name === 'iPhone OS'){
    $.rightNav.addEventListener('click', function(){
        // Let's handle multiple events
        if (!et.shouldFire()){
            return;
        }
        var disableView = Ti.UI.createView({
            height:'100%',
            width:'100%',
            top:0,
            backgroundColor:'#000',
            opacity:0.6,
            touchEnabled:true
        });

        var buyView = Alloy.createController('buy_earn', {
            parent: $
        }).getView();

        $.win.add(disableView);
        $.win.add(buyView);
        // Remove buy/earn view
        Alloy.Globals.removeBuyEarn = function() {
            $.win.remove(disableView);
            $.win.remove(buyView);
            et.setState(true);
        };
    });
}
// Refresh coins in titlebar
$.tabSetting.addEventListener('focus', function (e) {
    initApplicationCoins();
});