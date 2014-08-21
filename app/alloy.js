// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// check for network always
if (Titanium.Network.networkType === Titanium.Network.NETWORK_NONE) {
    var alertDialog = Titanium.UI.createAlertDialog({
        title: 'WARNING!',
        message: 'No internet connection',
        buttonNames: ['OK']
    });
    alertDialog.show();
}

// Rate our app
Alloy.Globals.Rate = require('RateMe');
var rate = Alloy.Globals.Rate;
// Set triggers
rate.appleId = '875227709';
rate.daysBetween = 10; // Days before asking and between each retry

// YouTube
var GoogleAuth = require('googleAuth');
var googleAuth = new GoogleAuth({
    clientId : '458249576316-6ki7emp6bl5g2l5jlos5b0am9iiv2v8g.apps.googleusercontent.com',
    clientSecret : 'BOkUcVJpOdmpES2XN8N4VF6L',
    propertyName : 'googleToken',
    quiet: false,
    scope : [ 'https://www.googleapis.com/auth/youtube.readonly']
});