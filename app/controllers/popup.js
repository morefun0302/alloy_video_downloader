var args = arguments[0] || {};
// Initial Coins
var videoUrl;
var style;
if (Ti.Platform.name === 'iPhone OS'){
  style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
}
else {
  style = Ti.UI.ActivityIndicatorStyle.DARK;
}
var actInd = Ti.UI.createActivityIndicator({
    backgroundColor:'#F5F5F5',
    color:'#ccc',
    font:{fontFamily:'Helvetica Neue', fontSize:16, fontWeight:'bold'},
    message:'Loading...',
    style:style,
    top:0,
    height:'100%',
    width:'100%'
});

// set title text for label row
$.popTitle.text = args.video_title;

// close the "popup"
$.btnCancel.addEventListener('click', function() {
    Alloy.Globals.removePopup();
});

$.btnGetCoin.addEventListener('click', function() {
    Alloy.Globals.removePopupAndShowPurchase();
});

$.btnDownload.addEventListener('singletap', function(e) {
    // CHECK IF USER HAS ENOUGH COINS
    getCoins();
});

function myCallback(adData) {
    if (parseInt(adData))
    {
        Alloy.Globals.swipeToClose();
        switch(args.video_provider.replace(/Source: /g, "")){
            case 'YouTube':
                var downloadUrl = "http://s192325.gridserver.com/udownloader/youtubesrc/getvideo.php?videoid=" + args.video_id + "&format=18";
                cachedVideoUrl(downloadUrl);
            break;
            case 'Facebook':
                var token = Ti.App.Properties.getString('fbToken');
                var vid = args.video_id;
                extractFbSrc(vid, token);
            break;
            case 'Instagram':
                var inToken = Ti.App.Properties.getString('inToken');
                var vid = args.video_id;
                extractInstagramSrc(vid, inToken);
            case 'Vimeo':
                var vid = args.video_id;
                extractVimeoSrc(vid);
            break;
            case 'DailyMotion':
                cachedDMVideoUrl(args.video_id);
            break;
            case 'Vine':
                var downloadUrl = args.video_url;
                cachedVideoUrl(downloadUrl);
            break;
        }
        Alloy.Globals.removePopup();
    } else {
        // OPEN SORRY VIEW
        Alloy.Globals.removePopupAndShowSorry();
    }
}

// return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else 
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}
extractFbSrc = function(vid, token)
{
    var sendit = Ti.Network.createHTTPClient({
        onerror : function(e) {
            Ti.API.debug(e.error);
            ind.hide();
            alert('There was an error during the connection');
        },
        timeout : 20000,
    });

    sendit.open('GET', 'http://developmentlcp.com/tubesavers/fbsrc/getvideo.php?vid=' + vid + "&token=" + token);
    sendit.send();

    // Function to be called upon a successful response
    sendit.onload = function() {
        var json = JSON.parse(this.responseText);
        // if the response is empty show a message
        if (json.length == 0) {
            ind.hide();
            alert('Error');
        }
        // Insert the JSON data to the table view
        var videos = json;
        cachedVideoUrl(videos.file);
    };
};
extractInstagramSrc = function(vid, token)
{
    var sendit = Ti.Network.createHTTPClient({
        onerror : function(e) {
            Ti.API.debug(e.error);
            ind.hide();
            alert('There was an error during the connection');
        },
        timeout : 20000,
    });
    sendit.open('GET', 'http://developmentlcp.com/tubesavers/instagramsrc/getvideo.php?vid=' + vid + "&token=" + token);
    sendit.send();

    // Function to be called upon a successful response
    sendit.onload = function() {
        var json = JSON.parse(this.responseText);
        // if the response is empty show a message
        if (json.length == 0) {
            ind.hide();
            alert('Error');
        }
        // Insert the JSON data to the table view
        var videos = json;
        cachedVideoUrl(videos.file);
    };
};
extractVimeoSrc = function(vid)
{
    var sendit = Ti.Network.createHTTPClient({
        onerror : function(e) {
            Ti.API.debug(e.error);
            ind.hide();
            alert('There was an error during the connection');
        },
        timeout : 20000,
    });

    sendit.open('GET', 'http://developmentlcp.com/tubesavers/vimeosrc/getvideo.php?videoid=' + vid );
    sendit.send();

    // Function to be called upon a successful response
    sendit.onload = function() {
        var json = JSON.parse(this.responseText);
        // if the response is empty show a message
        if (json.length == 0) {
            ind.hide();
            alert('Error');
        }
        // Insert the JSON data to the table view
        var videos = json;
        cachedVideoUrl(videos.file);
    };
};

var callback = false;
var counter = 0;
var ind = Ti.UI.createProgressBar({
    width:200,
    height:50,
    min:0,
    max:1,
    value:0,
    style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
    top:44,
    message:'Downloading Video',
    font:{fontSize:12, fontWeight:'bold'},
    color:'#fff'
});

cachedVideoUrl = function(url)
{
    // Made a tricky waiter for current downloads
    //Ti.API.log('This is current status:' + Ti.App.Properties.getInt('statusDownload'));
    if (Ti.App.Properties.getInt('statusDownload') == 0)
    {
        // If file was not found we try it again for 5 times
        if (callback == false && counter < 10) {
            ind.value = 0;
            Alloy.Globals.downloadWin.add(ind);
            // Focus download tab
            Alloy.Globals.mainTabGroup.setActiveTab(2);
            Alloy.Globals.downloadTableView.top = 94;
            // Create the HTTP client to download the file.
            var xhr = Ti.Network.createHTTPClient({ cache:false, setTimeout:60000 });
            xhr.onload = function() {
                if (typeof this.responseText === 'undefined') {
                    callback = false;
                    counter++;
                    Alloy.Globals.downloadWin.remove(ind);
                    cachedVideoUrl(url);
                } else {
                    Ti.Media.saveToPhotoGallery(this.responseData, {
                        success: function(e) {
                            // Callback successfully
                            callback = false;
                            counter = 0;
                            Ti.App.Properties.setInt('statusDownload', 0);
                            var alertDialog = Ti.UI.createAlertDialog();
                            alertDialog.title = 'Great!';
                            alertDialog.message = 'This video has been stored in your gallery.';
                            alertDialog.buttonNames = ['OK'];
                            alertDialog.show();
                            // Redeem 1 coin
                            redeemCoins(1);
                            // Save model
                            Alloy.Globals.downloadWin.remove(ind);
                            Alloy.Globals.downloadTableView.top = 43;
                            var downloadModel = Alloy.createModel("Download", {
                                video_id: args.video_id, video_title: args.video_title, video_excerpt: args.video_excerpt, video_provider: args.video_provider, video_url: args.video_url, video_image_path: args.video_image_path
                            });
                            // save model
                            downloadModel.save();
                            // force tables to update
                            Alloy.Collections.Download.fetch();
                            Alloy.Globals.refreshCoins();
                        },
                        error: function(e) {
                            Ti.API.info("GALLERY ERROR: "+e.error);
                        }
                    });
                }
            };
            xhr.ondatastream = function(e)
            {
                ind.show();
                ind.value = e.progress ;
                ind.message = "Downloading (" + Math.round(e.progress*100) + "%)";
            };
            xhr.onerror = function(e) {
                ind.hide();
                return;
            };
            // Issuing a GET request to the remote URL
            xhr.open('GET', url);
            // Finally, sending the request out.
            xhr.send();
        } else {
            Alloy.Globals.downloadWin.remove(ind);
            Alloy.Globals.downloadTableView.top = 43;
            var alertDialog = Ti.UI.createAlertDialog({
                title: 'SORRY!',
                message: 'We have not found any valid downloadable source for this video, this can be because the video contains copyrighted material or an invalid video format.',
                buttonNames: ['OK']
            });
            alertDialog.show();

        }
    } else {
        var preventDialog = Ti.UI.createAlertDialog();
        preventDialog.title = 'Warning!';
        preventDialog.message = 'You are currently downloading a video. Please wait until current download is finished.';
        preventDialog.buttonNames = ['OK'];
        preventDialog.show();
    }
};

cachedURL = function(url)
{
    var xhr = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(e) {
            var header = this.getLocation();
            if (Ti.Platform.osname !== 'android'){
                var header = this.getLocation();
            }
            cachedVideoUrl(header);
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            ind.hide();
        },timeout : 60000  // in milliseconds
    });
    // Issuing a GET request to the remote URL
    xhr.open('HEAD', url);
    xhr.autoRedirect = false;
    // Finally, sending the request out.
    xhr.send();
};

cachedDMVideoUrl = function(url)
{
    var xhr = Titanium.Network.createHTTPClient();
    xhr.setTimeout(20000);
    xhr.onload = function() {
        var videoUrl = this.responseText.match(/stream_h264_url":"(.*?)"/i)[1];
        /*
        var jsonObject = JSON.parse(this.responseText);
        var myJson = getObjects(jsonObject,'video_url','');
        */
        if(videoUrl.length !== 0)
        {
            var videoDecodeUrl = videoUrl.replace(/\\\//g, "/");
            // go to magic redirect
            cachedURL(videoDecodeUrl);
        } else {
            var alertDialog = Ti.UI.createAlertDialog({
                title: 'Sorry!',
                message: 'We have not found any valid downloadable source for this video, this can be because the video contains copyrighted material or an invalid video format.',
                buttonNames: ['OK']
            });
            alertDialog.show();
            ind.hide();
            Alloy.Globals.removePopup();
        }
    };

    xhr.open("GET","http://www.dailymotion.com/embed/video/" + url);
    xhr.send();
};

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

function redeemCoins(amount) {
    var post_url = 'http://s192325.gridserver.com/udownloader/ios/redeem.php';
    var data = {
        amount: amount,
        udid: Ti.App.Properties.getString('userID')
    };
    var xhrList = Ti.Network.createHTTPClient({
        // function called when the response data is available
        timeout : 5000
    });
    xhrList.open("POST", post_url);
    xhrList.send(data);
}