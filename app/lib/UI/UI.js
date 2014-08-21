var TU = null;

function UI ()
{
    
}

// provide a mechanism to throttle clicks on buttons, tableview rows, images, etc. that
// open windows; if you don't do this, and the user taps faster than the window is opened,
// you'll get multiple windows opened
//
// http://developer.appcelerator.com/question/117541/multiple-click-on-row-will-fire-event-multiple-times
UI.EventThrottle = function ()
{
    var _ignore_event = false;

    this.shouldFire = function ()
    {
        if (_ignore_event)
        {
            Ti.API.debug ('[TU.UI.EventThrottle] ignoring event...');
            return false;
        }
        
        _ignore_event = true;
        return true;
    };

    this.setState = function (state)
    {
        if (state)
        {
            _ignore_event = false;
        }
    };

    this.setTimeout = function (ms)
    {
        setTimeout (function () {
            _ignore_event = false;
        }, ms);
    };
};

UI.TUInit = function (tu)
{
    TU = tu;
};

module.exports = UI;