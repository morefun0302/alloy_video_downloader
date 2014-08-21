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
var collection = Alloy.Collections.Bookmark;
var TU = require ('TitanUp');

// Set global bookmark tab badge
Alloy.Globals.tabBookmark = $.tabBookmark;
// Let's update our database elements
collection.fetch();

// Retrieve db data in json format and add stripped rows
function transformCollection(model) {
    var transformedData = model.toJSON();
    transformedData.video_provider = 'Source: ' + transformedData.video_provider;
    return transformedData;
}

// Prevent double tap in download button
var etDownload = new TU.UI.EventThrottle();
$.bookmarkTableView.addEventListener('click', function(e) {
    if (Ti.Platform.name === 'android') {
        // Clear search bar
        $.search.value ="";
        // hiding and showing the search bar forces it back to its non-focused appearance.
        $.search.hide();
        $.search.show();
    }
    if(e.rowData)
    {
        if (e.source.id == 'infoVideo' || e.source.id == 'lblCloseMe') {
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
                var swipeViewController = Alloy.createController('bookmarkswipe_row').getView();
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
        } else if (e.source.id === 'btnRemove') {
            var alertDialog = Ti.UI.createAlertDialog({
                title: 'Remove',
                message: 'Do you want to remove this bookmark item?',
                buttonNames: ['Yes','No'],
                cancel: 1
            });
            // Show alert
            alertDialog.show();
            var tableViewEvent = e;
            alertDialog.addEventListener('click', function(e) {
                if (e.index == 0) { // clicked "YES"
                    // Delete the bookmark
                    var removeCollection = collection.get(tableViewEvent.rowData.model);
                    // Delete the model object
                    removeCollection.destroy();
                    // Force tables to update
                    collection.fetch();
                }
            });
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
            // This is a bad practice, but in order to acomplish design...
            Alloy.Globals.removePopup = function (){
                $.win.remove(popupController);
                $.win.remove(disableView);
                etDownload.setState(true);
            };
            Alloy.Globals.swipeToClose = function (){
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
                // we need the purchase view to make it global
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
                // We need the purchase view and make it global
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

// Refresh coins in titlebar
Alloy.Globals.tabBookmark.addEventListener('focus', function (e) {
    Alloy.Globals.tabBookmark.badge = null;
    initApplicationCoins();
});