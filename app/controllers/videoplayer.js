var args = arguments[0] || {};
$.videoPlayer.fullscreen = true;
$.videoPlayer.mediaControlStyle = Titanium.Media.VIDEO_CONTROL_DEFAULT;
$.videoPlayer.scalingMode = Titanium.Media.VIDEO_SCALING_ASPECT_FIT;
$.videoPlayer.url = args.video_video_path;

// After video is complete close the window
$.videoPlayer.addEventListener('complete', function(e){
    if (e.reason == 0) {
        $.videoPlayer.stop();
        $.videoPlayer.release();
        $.vidWin.close();
    };
});

// If video player is not fullscreen close window
$.videoPlayer.addEventListener('fullscreen', function(e){
    if (e.entering == 0) {
        $.videoPlayer.stop();
        $.videoPlayer.release();
        $.vidWin.close();
    };
});