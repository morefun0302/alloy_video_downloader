
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
var collection = Alloy.Collections.Download;
var TU = require ('TitanUp');
// Global References
Alloy.Globals.tabDownload = $.tabDownload;
Alloy.Globals.downloadWin = $.win;
Alloy.Globals.downloadTableView = $.downloadTableView;

// Let's update our database elements
collection.fetch();

// Retrieve db data in json format and add stripped rows
function transformCollection(model) {
    var transformedData = model.toJSON();
    transformedData.video_provider = 'Source: ' + transformedData.video_provider;
    return transformedData;
}
// Get videoplayer on click
$.downloadTableView.addEventListener('click', function(e) {
    if (Ti.Platform.name === 'android') {
        // Clear search bar
        $.search.value ="";
        // hiding and showing the search bar forces it back to its non-focused appearance.
        $.search.hide();
        $.search.show();
    }

    if(e.rowData)
    {
        if (e.source.id == 'loadingImgView') {
            var player = require ('player');
            player.showPlayer(e);
        } else if (e.source.id == 'infoVideo') {
            opengallery.show();
            return;
            if(e.row.details != null) {
                interval = setInterval(function () {
                    // Remove swipe view and details reference
                    e.row.remove(e.row.children[1]);
                    e.row.details = null;
                    // Animate container view to default place
                    e.row.children[0].animate({left:0, duration:200});
                    // Enable coin button again
                    e.row.children[0].children[3].touchEnabled = true;
                    clearInterval(interval);
                }, 200);
            }
        }
    }
});
// Open Option Dialog
var opengallery = Ti.UI.createOptionDialog({
    title:'U Downloader Videos',
    options:['Open Gallery', 'Close'],
    cancel:1
});
// If open gallery was pressed, open it
opengallery.addEventListener('click', function(e) {
    if (e.index === 0){
        Ti.Media.openPhotoGallery({
            mediaTypes: [Ti.Media.MEDIA_TYPE_VIDEO]
        });
    }
});

// Detect swipe event for the tableview
$.downloadTableView.addEventListener('swipe', function(e) {
    if(e.direction == 'left'){
        // Get swipping view
        var swipeViewController = Alloy.createController('downloadswipe_row').getView();
        e.row.add(swipeViewController);
        e.row.details = swipeViewController;

        var tableViewEvent = e;
        Alloy.Globals.deleteVideoData = function (){
            var deleteCollection = collection.get(tableViewEvent.rowData.model);
            deleteCollection.destroy();
            // force tables to update
            collection.fetch();
        };
    }
});
//$.downloadTableView.search = $.search;
// Remove Keyboard in search
$.search.addEventListener('cancel', function(e)
{
    collection.fetch();
    $.search.blur();
});

$.search.addEventListener('return', function(e){
    // Filter the fetched collection before rendering. Don't return the
    // collection itself, but instead return an array of models
    // that you would like to render.
    collection.filter(function(model){
        var ourData = model.toJSON();
        var filtered = collection.filter(function(data) {
          if (data.get('video_title').toLowerCase().indexOf(e.value.toLowerCase()) != -1 )
                return data;
          });
        collection.reset(filtered);
    });

    $.search.blur();
});
// Open buy/earn view
// avoid multiple events
var et = new TU.UI.EventThrottle();
if (Ti.Platform.name === 'iPhone OS') {
    $.rightNav.addEventListener('click', function(){
        // Prevent strange issues with keyboard
        $.search.blur();
        // Let's handle multiple events
        if (!et.shouldFire())
        {
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
        Alloy.Globals.removeBuyEarn = function() {
            $.win.remove(disableView);
            $.win.remove(buyView);
            et.setState(true);
        };
    });
}
// Refresh coins in titlebar
Alloy.Globals.tabDownload.addEventListener('focus', function (e) {
    initApplicationCoins();
});
Alloy.Globals.refreshCoins = function() {
    initApplicationCoins();
};