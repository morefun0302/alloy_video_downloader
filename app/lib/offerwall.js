var db = require('db');
var base_url = 'http://s192325.gridserver.com/udownloader/ios';

if (Ti.Platform.osname === 'android') {
    var deviceOS = 'android';
    var app_key = '2fe502b9';
} else {
    var deviceOS = 'ios';
    var app_key = '302c0699';
}

exports.show = function(){

    var udid = Ti.Platform.id;
    Ti.API.log('http://www.supersonicads.com/delivery/mobilePanel.php?applicationUserId='+udid+'&applicationKey='+app_key+'&deviceOs='+deviceOS+'&deviceIds[MAC]='+Ti.Platform.macaddress+'&deviceModel='+Ti.Platform.model+'&deviceOEM='+Ti.Platform.manufacturer+'&deviceOSVersion='+Ti.Platform.version);
    // web view to load offerwall
    var wv = Ti.UI.createWebView({
        backgroundColor: '#FFF',
        url:'http://www.supersonicads.com/delivery/mobilePanel.php?applicationUserId='+udid+'&applicationKey='+app_key+'&deviceOs='+deviceOS+'&deviceIds[MAC]='+Ti.Platform.macaddress+'&deviceModel='+Ti.Platform.model+'&deviceOEM='+Ti.Platform.manufacturer+'&deviceOSVersion='+Ti.Platform.version
    });

    // window to hold offerwall
    var ww = Ti.UI.createWindow({
        top:20
    });

    // close button - when this is clicked the check.php callback is called
    var close = Ti.UI.createButton({
        backgroundImage:'close.png',
        width:24,
        height:24,
        top:5,
        right:5,
        zIndex:99
    }); 

    close.addEventListener("click", function(){
        if(wv.canGoBack()) {
            wv.goBack();
        } else {
            ww.close();
        }
    });

    // If the user completes an offer, it will get logged into the database via the grant.php callback.
    // when the user closes the window we check if an entry was created, meaning they completed
    // an offer. if one exists then we give them the coins
    ww.addEventListener("close", function(){

         var url = base_url + "/check.php?udid=" + Ti.Platform.id;
         var client = Ti.Network.createHTTPClient({
             onload : function(e) {
                 if ( IsJson(this.responseText)){
                     var res = JSON.parse(this.responseText);
                     if(res.amount > 0)
                     {
                         //  add coins to database
                         updateCoins(res.amount);
                     }
                 }
             },
             // function called when an error occurs, including a timeout
             onerror : function(e) {},
             timeout : 60000
         });
         client.open("GET", url);
         client.send();
    });
    ww.add(wv);
    ww.add(close);
    // make sure to set the window to modal
    ww.open({modal:true});

    function IsJson(str)
    {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    function updateCoins(amount)
    {
        var post_url = 'http://s192325.gridserver.com/udownloader/ios/credit.php';
        var data = {
            amount: amount,
            udid: Ti.App.Properties.getString('userID')
        };
        var xhrList = Ti.Network.createHTTPClient({
            onload : function(e) {
                // function called when the response data is available
                getCoins();
            },
            timeout : 5000
        });

        xhrList.open("POST", post_url);
        xhrList.send(data);
    }

    function getCoins() {

        var base_url = 'http://s192325.gridserver.com/udownloader/ios';
        // update or register user device to retrieve the coins
        var url = base_url + "/register.php?udid=" + Ti.App.Properties.getString('userID');

        var client = Ti.Network.createHTTPClient({
            onload : function(e) {
                var res = JSON.parse(this.responseText);
                myCallback(res.coins);
            },
            // function called when an error occurs, including a timeout
            onerror : function(e) {},
            timeout : 5000
        });
        client.open("GET", url);
        client.send();
    }

    function myCallback(total)
    {
        var total_lbl = total == 1 ? 'coin' : 'coins';
        // alert the user they got coins
        var dialog = Ti.UI.createAlertDialog({
            message: "You have " + total + " " + total_lbl + " total.",
            ok: 'OK',
            title: 'You Got Coins!'
        }).show();
    }
};