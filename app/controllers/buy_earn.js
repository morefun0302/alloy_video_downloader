var args = arguments[0] || {};
var parent = args.parent;
var TU = require ('TitanUp');
// close the "sorry"
$.btnCancel.addEventListener('click', function() {
    Alloy.Globals.removeBuyEarn();
});

var etBuy = new TU.UI.EventThrottle();
$.btnBuyCoin.addEventListener('click', function() {
    // Let's handle multiple events
    if (!etBuy.shouldFire()){
        return;
    }
    // hook for the purchase window
    Alloy.createController('purchase', {
        eventThrottle: etBuy
    }).getView().open();
    Alloy.Globals.removeBuyEarn();
});

$.btnEarnCoin.addEventListener('click', function() {
    var offerwall = require('offerwall');
    offerwall.show();
    Alloy.Globals.removeBuyEarn();
});