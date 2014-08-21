googleAuth.isAuthorized(function() {
    Ti.API.info('Access Token: ' + googleAuth.getAccessToken());
}, function() {
    //authorize first
    googleAuth.authorize();
});

// YOUTUBE
// Attach some simple on/off actions
$.youTubeBtn.on = function() {
    this.backgroundColor = '#53db46';
    this.value = true;
    Ti.App.Properties.setBool('youTubeProvider', this.value);
};

$.youTubeBtn.off = function() {
    this.backgroundColor = '#fff';
    this.value = false;
    Ti.App.Properties.setBool('youTubeProvider', this.value);
};

$.youTubeBtn.addEventListener('click', function(e) {
    if (false === e.source.value) {
        e.source.on();
    } else {
        e.source.off();
    }
});

// DAILY MOTION
// Attach some simple on/off actions
$.dailyBtn.on = function() {
    this.backgroundColor = '#53db46';
    this.value = true;
    Ti.App.Properties.setBool('dailyMotionProvider', this.value);
};

$.dailyBtn.off = function() {
    this.backgroundColor = '#fff';
    this.value = false;
    Ti.App.Properties.setBool('dailyMotionProvider', this.value);
};

$.dailyBtn.addEventListener('click', function(e) {
    if (false == e.source.value) {
        e.source.on();
    } else {
        e.source.off();
    }
});

// TODO: Fix properties bool
var fields = ['youTubeProvider','dailyMotionProvider'];

var youtubeProp = Ti.App.Properties.getBool('youTubeProvider', true);
var dailyProp = Ti.App.Properties.getBool('dailyMotionProvider', true);

// Let's load our app properties
_.each(fields, function(value, id) {
    // Be carefull with the order of elements from the view
    switch(id) {
        case 0:
            (youtubeProp ? $.youTubeBtn.on() : $.youTubeBtn.off() );
        break;
        case 1:
            (dailyProp ? $.dailyBtn.on() : $.dailyBtn.off() );
        break;
    }
});



// Apply filter changes
$.btnApply.addEventListener('click', function(){
    $.btnApply.backgroundColor = '#E31041';
    // Prevent the user when no video provider was set
    if ($.youTubeBtn.value == false && 
        $.dailyBtn.value == false ) {
        var preventDialog = Ti.UI.createAlertDialog({
            title:'WARNING!',
            message:'Please select at least one video provider from the list',
            buttonNames:['OK']
        });
        preventDialog.addEventListener('click', function(e) {
            if (e.index === 0) {
                $.btnApply.backgroundColor = '#ED0F20';
            }
            return;
        });
        preventDialog.show();
        return;
    }
    // Prevent device for internet connection
    if (Titanium.Network.networkType === Ti.Network.NETWORK_NONE) {
        var alertDialog = Ti.UI.createAlertDialog({
            title:'WARNING!',
            message:'No internet connection',
            buttonNames:['OK']
        });
        alertDialog.show();
    } else {
        // Save the filters and never show it again
        retrieveClient();
        Ti.App.Properties.setBool('showFilters', false);
        $.index.close();
        $.index = null;
    }
});

function retrieveClient() {
    var base_url = 'http://s192325.gridserver.com/udownloader/retrieve';
    googleAuth.isAuthorized(function() {

    var xhrList = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(e) {

            var resp = JSON.parse(this.responseText);

            Ti.App.Properties.setString('userID', resp.id);

            Alloy.createController('home').getView().open();
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Titanium.UI.createAlertDialog({
                title : 'Error',
                message : 'Can\'t authorize account'
            });
            Ti.API.error('HTTP: ' + JSON.stringify(e));
        },
        timeout : 5000
    });
    xhrList.open("GET", base_url + '/' + googleAuth.getAccessToken());
    xhrList.send();
    }, function() {
        //authorize first
        googleAuth.authorize();
    });
}

Ti.App.Properties.setInt('statusDownload', 0);
// open window
if (Ti.App.Properties.getBool('showFilters') == null) {
    $.index.open();
} else {
    var win = Alloy.createController('home').getView();
    win.open();
}