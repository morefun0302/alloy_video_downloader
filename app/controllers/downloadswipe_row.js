var args = arguments[0] || {};

$.enabledWrapperView.addEventListener('swipe', function(e) {
    if (e.direction == 'right'){
        $.enabledWrapperView.hide();
    }
});
// Remove button click
$.btnRemove.addEventListener('singletap', function(e) {
    var alertDialog = Ti.UI.createAlertDialog({
        title: 'Remove',
        message: 'Are you sure you want to delete this item?',
        buttonNames: ['Yes','No'],
        cancel: 1
    });
    alertDialog.show();

    alertDialog.addEventListener('click', function(e) {
        if (e.index == 0) { // clicked "YES"
            Alloy.Globals.deleteVideoData();
        }
    });
});