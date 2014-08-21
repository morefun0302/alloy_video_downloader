Alloy.Globals.navQty = $.navQty;
function initApplicationCoins() {
    var base_url = 'http://s192325.gridserver.com/udownloader/ios';
    // update or register user device to retrieve the coins
    var url = base_url + "/register.php?udid=" + Ti.App.Properties.getString('userID');
    Ti.API.log('initApplicationCoins' + url);

    var client = Ti.Network.createHTTPClient({
        onload : function(e) {
            var res = JSON.parse(this.responseText);
            if (Ti.Platform.name === 'iPhone OS'){
                Alloy.Globals.navQty.text = res.coins;
            }
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {},
        timeout : 5000
    });
    client.open("GET", url);
    client.send();
}

var TU = require ('TitanUp');
var style;

// Set the style for the indicator
if (Ti.Platform.name === 'iPhone OS'){
  style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
} else {
  style = Ti.UI.ActivityIndicatorStyle.DARK;
}
var actInd = Ti.UI.createActivityIndicator({
    backgroundColor:'#F5F5F5',
    color:'#ccc',
    font:{fontFamily:'Helvetica Neue', fontSize:16, fontWeight:'bold'},
    message:'Loading Videos...',
    style:style,
    top:0,
    height:'100%',
    width:'100%'
});
// Add activity indicator to the view and show it
$.win.add(actInd);
actInd.show();

var youtube = (Ti.App.Properties.getBool('youTubeProvider', false) ? "/youtube" : "");
var daily = (Ti.App.Properties.getBool('dailyMotionProvider', false) ? "/dailymotion" : "");

// Retrieve populated data
var data = [];
var sendit = Ti.Network.createHTTPClient({
    onerror : function(e) {
        actInd.hide();
        Ti.API.debug(e.error);
        alert('There was an error during the connection');
    },
    timeout : 50000,
});

sendit.open('GET', 'http://s192325.gridserver.com/udownloader/search/collegehumor/filter' + youtube + daily + '/fb/na' + '/in/na');
sendit.send();

// Function to be called upon a successful response
sendit.onload = function() {
    initApplicationCoins();
    var json = JSON.parse(this.responseText);
    // Ff the response is empty show a message
    if (json.length == 0) {
        $.videoTableView.headerTitle = "No search results found";
    }
    // Insert the JSON data to the table view
    var videos = json;
    for ( var i = 0, iLen = videos.length; i < iLen; i++) {
        data.push(Alloy.createController('video_row', {
            video_id    : videos[i].video_id,
            video_title : videos[i].video_title,
            video_excerpt : videos[i].video_excerpt,
            video_url     : videos[i].video_url,
            video_image_path : videos[i].video_image_path,
            video_provider   : videos[i].video_provider,
            video_background : (i % 2) ? "#FFF" : "#F5F5F5"
        }).getView());
    }
    $.videoTableView.setData(data);
    actInd.hide();
};

if (Ti.Platform.name === 'android') {
    $.videoTableView.search = $.search;
}
// Prevent double tap in download button
var etDownload = new TU.UI.EventThrottle();
$.videoTableView.addEventListener('click', function(e) {
    if (Ti.Platform.name === 'android') {
        // Clear search bar
        $.search.value ="";
        // hiding and showing the search bar forces it back to its non-focused appearance.
        $.search.hide();
        $.search.show();
    }
    if(e.rowData)
    {
        Ti.API.log(e.source.id);
        if (e.source.id == 'btnBookmark') {
            var bookmarkModel = Alloy.createModel("Bookmark", {
                video_id: e.rowData.video_id,
                video_title: e.rowData.video_title,
                video_excerpt: e.rowData.video_excerpt,
                video_provider: e.rowData.video_provider,
                video_url: e.rowData.video_url,
                video_image_path: e.rowData.video_image_path
            });
            // Save model
            bookmarkModel.save();
            // Force tables to update
            Alloy.Collections.Bookmark.fetch();
            // Get the bookmark tab, badge count and increment his value
            Alloy.Globals.tabBookmark.badge = Alloy.Globals.tabBookmark.getBadge() + 1;
            //e.rowData.details.hide();
        } else if (e.source.id == 'infoVideo' || e.source.id == 'lblCloseMe') {
            if(e.row.details != null) {
                interval = setInterval(function () {
                    // Animate container view to default place
                    e.row.children[0].children[1].children[0].opacity = 1;
                    e.row.children[0].children[1].children[1].opacity = 1;
                    e.row.children[0].children[1].children[2].opacity = 1;
                    e.row.children[0].animate({left:0, duration:200});
                    e.row.details.animate({right:-140, duration:200});
                    // Remove swipe view and details reference
                    e.row.children[0].children[2].hide();
                    e.row.remove(e.row.children[1]);
                    e.row.details = null;
                    // Enable coin button again
                    e.row.children[0].children[3].touchEnabled = true;
                    clearInterval(interval);
                }, 200);
                e.row.status = true;
            }
        } else if (e.source.id == 'coinView') {
            // Get swipping view
            if (e.row.status || e.row.status == null)
            {
                var swipeViewController = Alloy.createController('videoswipe_row').getView();
                e.row.add(swipeViewController);
                interval = setInterval(function () {
                    swipeViewController.zIndex = 3;
                    e.row.children[0].children[1].children[0].opacity = 0.2;
                    e.row.children[0].children[1].children[1].opacity = 0.2;
                    e.row.children[0].children[1].children[2].opacity = 0.2;
                    e.row.children[0].children[2].show();
                    e.row.children[0].animate({left:-140, duration:240});
                    swipeViewController.animate({right:0, duration:200});
                    clearInterval(interval);
                }, 200);
                // Add a reference of the overlapping element inside the row
                e.row.details = swipeViewController;
                e.row.status = false;
                // Disable coin button in order to avoid throttle clicks
                e.row.children[0].children[3].touchEnabled = false;
            }
        } else if (e.source.id == 'btnDownload') {
            // Let's handle multiple events
            if (!etDownload.shouldFire()) {
                return;
            }
            var popupController = Alloy.createController('popup', {
                video_id: e.rowData.video_id,
                video_title: e.rowData.video_title,
                video_excerpt: e.rowData.video_excerpt,
                video_provider: e.rowData.video_provider,
                video_url: e.rowData.video_url,
                video_image_path: e.rowData.video_image_path
            }).getView();
            // Hook for the popup window
            var disableView = Ti.UI.createView({
                height:'100%',
                width:'100%',
                top:0,
                backgroundColor:'#000',
                opacity:0.6,
                touchEnabled:true
            });

            $.win.add(popupController);
            $.win.add(disableView);
            $.win.disableView = disableView;
            etDownload.setState(true);
            // This is a bad practice, but in order to acomplish design...
            Alloy.Globals.removePopup = function (){
                $.win.remove(popupController);
                $.win.remove(disableView);
            };
            Alloy.Globals.swipeToClose = function (){
                initApplicationCoins();
                if(e.row.details != null) {
                    interval = setInterval(function () {
                        // Remove swipe view and details reference
                        e.row.remove(e.row.children[1]);
                        e.row.children[0].children[2].hide();
                        e.row.children[0].children[1].children[0].opacity = 1;
                        e.row.children[0].children[1].children[1].opacity = 1;
                        e.row.children[0].children[1].children[2].opacity = 1;
                        e.row.details = null;
                        // Animate container view to default place
                        e.row.children[0].animate({left:0, duration:200});
                        // Enable coin button again
                        e.row.children[0].children[3].touchEnabled = true;
                        clearInterval(interval);
                    }, 200);
                }
            };
            Alloy.Globals.removePopupAndShowPurchase = function (){
                $.win.remove(popupController);
                $.win.remove(disableView);
                // We need the purchase view to make it global
                Alloy.Globals.purchaseController = Alloy.createController('purchase').getView();
                $.win.add(Alloy.Globals.purchaseController);
            };
            Alloy.Globals.removePurchase = function (){
                $.win.remove(Alloy.Globals.purchaseController);
                Alloy.Globals.purchaseController = null;
            };
            Alloy.Globals.removePopupAndShowSorry = function (){
                $.win.remove(popupController);
                Alloy.Globals.sorryController = Alloy.createController('sorry').getView();
                $.win.add(Alloy.Globals.sorryController);
            };
            Alloy.Globals.removeSorry = function (){
                $.win.remove(disableView);
                $.win.remove(Alloy.Globals.sorryController);
            };
            Alloy.Globals.removeSorryAndShowPurchase = function (){
                $.win.remove(Alloy.Globals.sorryController);
                $.win.remove(disableView);
                // We need the purchase view to make it global
                Alloy.Globals.purchaseController = Alloy.createController('purchase').getView();
                $.win.add(Alloy.Globals.purchaseController);
            };
        } else if (e.source.id == 'playVideo') {
            var player = require ('player');
            player.showPlayer(e);
        } else {
            return;
        }
    }
});

// search event
$.search.addEventListener('return', function(){
    var searchValue = encodeURIComponent($.search.value);
    actInd.show();
    function getOurSearch(searchValue){

        var data = [];
        var sendit = Ti.Network.createHTTPClient({
            onerror : function(e) {
                actInd.hide();
                Ti.API.debug(e.error);
                alert('There was an error during the connection');
            },
            timeout : 20000,
        });

        // Let's gonna set the url to handle
        var youtube = (Ti.App.Properties.getBool('youTubeProvider', false) ? "/youtube" : "");
        var daily = (Ti.App.Properties.getBool('dailyMotionProvider', false) ? "/dailymotion" : "");

        sendit.open('GET', 'http://s192325.gridserver.com/udownloader/search/' + searchValue + '/filter' + youtube + daily + '/fb/na' + '/in/na');
        sendit.send();

        // Function to be called upon a successful response
        sendit.onload = function() {
            var json = JSON.parse(this.responseText);
            // if the response is empty show a message
            if (json.length == 0) {
                $.videoTableView.headerTitle = "No search results found";
            }
            // Insert the JSON data to the table view
            var videos = json;
            for ( var i = 0, iLen = videos.length; i < iLen; i++) {
                data.push(Alloy.createController('video_row', {
                    video_id    : videos[i].video_id,
                    video_title : videos[i].video_title,
                    video_excerpt : videos[i].video_excerpt,
                    video_url     : videos[i].video_url,
                    video_image_path : videos[i].video_image_path,
                    video_provider   : videos[i].video_provider,
                    video_background : (i % 2) ? "#FFF" : "#F5F5F5"
                }).getView());
            }
            $.videoTableView.setData(data);
            actInd.hide();
        };
    }
    // let's update tableview data
    getOurSearch(searchValue);
    $.search.blur();
});

// Remove Keyboard in search
$.search.addEventListener('cancel', function(e)
{
   $.search.blur();
});

// Avoid multiple events
var et = new TU.UI.EventThrottle();
// Open buy/earn view
if (Ti.Platform.name === 'iPhone OS'){
    $.rightNav.addEventListener('click', function(){
        // Prevent strange issues with keyboard
        $.search.blur();

        

            // Let's handle multiple events
            if (!et.shouldFire()) {
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

            // Remove sorry view
            Alloy.Globals.removeBuyEarn = function() {
                $.win.remove(disableView);
                $.win.remove(buyView);
                et.setState(true);
            };
        
    });
}

// Refresh coins in titlebar
$.tabVideo.addEventListener('focus', function (e) {
    initApplicationCoins();
    if (Ti.App.Properties.getBool('settingsChange') != null && Ti.App.Properties.getBool('settingsChange'))
    {
        var searchValue = ($.search.value == null ? 'collegehumor' : $.search.value );
        actInd.show();
        getOurVideos(searchValue);
    }
});

// BAD PRACTICE PLEASE AVOID IT IF YOU CAN
function getOurVideos(searchValue){

    var data = [];
    var sendit = Ti.Network.createHTTPClient({
        onerror : function(e) {
            actInd.hide();
            Ti.API.debug(e.error);
            alert('There was an error during the connection');
        },
        timeout : 20000,
    });

    // Let's gonna set the url to handle
    var youtube = (Ti.App.Properties.getBool('youTubeProvider', false) ? "/youtube" : "");
    var daily = (Ti.App.Properties.getBool('dailyMotionProvider', false) ? "/dailymotion" : "");

    var searchValue = (searchValue == '' ? 'collegehumor' : encodeURIComponent(searchValue));

    sendit.open('GET', 'http://s192325.gridserver.com/udownloader/search/' + searchValue + '/filter' + youtube + daily + '/fb/na' + '/in/na');
    sendit.send();

    // Function to be called upon a successful response
    sendit.onload = function() {
        var json = JSON.parse(this.responseText);
        // if the response is empty show a message
        if (json.length == 0) {
            $.videoTableView.headerTitle = "No search results found";
        }
        // Insert the JSON data to the table view
        var videos = json;
        for ( var i = 0, iLen = videos.length; i < iLen; i++) {
            data.push(Alloy.createController('video_row', {
                video_id    : videos[i].video_id,
                video_title : videos[i].video_title,
                video_excerpt : videos[i].video_excerpt,
                video_url     : videos[i].video_url,
                video_image_path : videos[i].video_image_path,
                video_provider   : videos[i].video_provider,
                video_background : (i % 2) ? "#FFF" : "#F5F5F5"
            }).getView());
        }
        $.videoTableView.setData(data);
        // Clean settings changes flag
        Ti.App.Properties.setBool('settingsChange', false);
        actInd.hide();
    };
}