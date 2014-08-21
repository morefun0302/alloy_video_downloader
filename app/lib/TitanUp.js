/**
 * TitanUp library for Titanium Mobile development
 *
 * To use it, put this in your app.js (in the global scope):
 * var TU = require ('TitanUp');
 */

var start = new Date().getTime();

_version = '0.1.0';

function TitanUp (){
}

TitanUp.getVersion = function ()
{
    return _version;
};

TitanUp.UI = require ('/UI/UI');
TitanUp.UI.TUInit (TitanUp);

TitanUp.Globals = {};

var elapsed = new Date().getTime() - start;
Ti.API.debug ("[TitanUp] load time: " + elapsed + " ms");

module.exports = TitanUp;