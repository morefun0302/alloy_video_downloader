function showPlayer(e){
    if (Ti.Platform.osname === 'android') {
        Ti.Platform.openURL(e.rowData.video_url);
    } else {
        var playerWin = Ti.UI.createWindow({
            backgroundColor : '#ccc'
        });

        var htmlheader = "<!DOCTYPE html><html><body><table style='margin-top:70px;'><td style='vertical-align:middle;'><iframe id='ytplayer' type='text/html' width='100%' height='100%' src='";
        if (e.rowData.video_provider == "DailyMotion")
        {
            var htmlfooter = "http://www.dailymotion.com/embed/video/" + e.rowData.video_id + "' frameborder='0' allowfullscreen></td></tr></table></body></html>";
        }
        else {
            var htmlfooter = "' frameborder='0' allowfullscreen></td></tr></table></body></html>";
        }

        var videoUrl = e.rowData.video_url;
        if (e.rowData.video_provider == "DailyMotion")
        {
            var htmlmash = htmlheader + htmlfooter;
        } else if (e.rowData.video_provider == "Vimeo")
        {
            var htmlmash = htmlheader + "http://player.vimeo.com/video/" + e.rowData.video_id + htmlfooter;
        }
        else {
            var htmlmash = htmlheader + videoUrl + htmlfooter;
        }
        /* CREATE WEBVIEW */
        if (e.rowData.video_provider == "Instagram")
        {
            var webview = Ti.UI.createWebView({url: e.rowData.video_url});
        } else if (e.rowData.video_provider == "Facebook")
        {
            var webview = Ti.UI.createWebView({url: e.rowData.video_url});
        }
        else{
            var webview = Ti.UI.createWebView({
                top:0,
                html:htmlmash,
                width:Ti.UI.FILL,
                scalesPageToFit:false,
                backgroundColor:'#000'
            });
        }
        /* TOOLBAR SETTINGS */
        var cancel = Ti.UI.createButton({
            systemButton: Ti.UI.iPhone.SystemButton.CANCEL
        });

        flexSpace = Ti.UI.createButton({
            systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });

        var toolbar = Ti.UI.iOS.createToolbar({
            items:[flexSpace, flexSpace, flexSpace, flexSpace, cancel],
            top:20,
            extendBackground:true,
            barColor:'#cc181e',
            tintColor:'#fff'
        });

        cancel.addEventListener('click', function(e) {
            playerWin.close();
        });

        playerWin.add(webview);
        playerWin.add(toolbar);
        playerWin.open();
    }
}
exports.showPlayer = showPlayer;