// close the "sorry"
$.btnCancel.addEventListener('click', function() {
    Alloy.Globals.removeSorry();
});

$.btnGetCoin.addEventListener('click', function() {
    Alloy.Globals.removeSorryAndShowPurchase();
});