var args = arguments[0] || {};

// Load inapp module
var InAppProducts = null;
InAppProducts = require('com.logicallabs.inappproducts');

$.fg.init({
    columns:2,
    space:20,
    gridBackgroundColor:'#000',
    itemHeightDelta: 0,
    itemBackgroundColor:'#eee',
    itemBorderColor:'transparent',
    itemBorderWidth:0,
    itemBorderRadius:0
});

// This call (or any other) may fail on Android if the module hasn't finished
// its initialization routine yet -- always wait for the stateChange event!!!
Ti.API.info('Module ready? ' + 
    (InAppProducts.getSupportStatus() !== InAppProducts.SUPPORT_STATUS_ERROR));

// Note: These product IDs must match the product IDs you configure on
// iTunes Connect and Android Developer Console!
var productIDs =
    [
        "UDownloaderA50","UDownloaderB110","UDownloaderC260","UDownloaderD500","UDownloaderE1000","UDownloaderF10000"
    ];

var productObjects, currentProduct, purchaseObjects, currentPurchase;

var ANDROID = Ti.Platform.osname === "android";

var buildPurchasesTable, purchaseStateToString, buildProductsTable,
updateProductWindow, updatePurchaseWindow;

var ti = {
    tables : {
        //products : Ti.UI.createTableView(cfg.table),
        //purchases : Ti.UI.createTableView(cfg.table)
    }
};

buildProductsTable = function(table, products) {
    var i, items;

    items = [];

    products.forEach(function(product) {

        var values = {
            product: product
        };

        var view = Alloy.createController('item_grid', {
            sku: product.SKU,
            title: product.title
        }).getView();

        items.push({
            view:view,
            data:values
        });
    });
    table.addGridItems(items);
};

purchaseStateToString = function(state) {
    switch (state) {
        case InAppProducts.PURCHASE_STATE_PURCHASED:
            return 'purchased';
        case InAppProducts.PURCHASE_STATE_CANCELED:
            // Android only
            return 'canceled';
        case InAppProducts.PURCHASE_STATE_REFUNDED:
            // Android only
            return 'refunded';
        case InAppProducts.PURCHASE_STATE_PURCHASING:
            // iOS only
            return "purchasing";
        case InAppProducts.PURCHASE_STATE_FAILED:
            // iOS only
            return "failed";
        case InAppProducts.PURCHASE_STATE_RESTORED:
            // iOS only
            return "restored";
        default:
            return 'unknown';
    }
};

function traverseDirectory(file, indent) {
    // This function is used to recursively print the contents of the
    // downloaded hosted content.

    if (indent === undefined) {
        Ti.API.info('Listing of directory ' + file.name);
        indent = '|-';
    } else {
        Ti.API.info(indent + file.name);
        indent = '|  ' + indent;
    }

    if (file.isDirectory()) {
        file.getDirectoryListing().forEach(function(fileName) {
            traverseDirectory(Ti.Filesystem.getFile(file.nativePath, fileName), indent);
        });
    }
}

function printDownloadInfo(download) {
    var file;

    Ti.API.info('SKU:' + download.purchase.SKU);
    Ti.API.info('Content ID: ' + download.contentID);
    Ti.API.info('Content length: ' + download.contentLength);
    Ti.API.info('Content version: ' + download.contentVersion);
    Ti.API.info('State: ' + downloadStateToString(download.state));
    Ti.API.info('Progress: ' + download.progress);
    Ti.API.info('Time remaining: ' + 
            (download.timeRemaining === InAppProducts.DOWNLOAD_TIME_UNKNOWN ?
                'unknown' : download.timeRemaining.toString()));

    if (download.errorCode) {
        Ti.API.info('Error code: ' + download.errorCode);
        Ti.API.info('Error message: ' + download.errorMessage);
    }

    if (download.state === InAppProducts.DOWNLOAD_STATE_FINISHED) {
        Ti.API.info('Content URL: ' + download.contentURL);
        if (download.contentURL) {
            file = Ti.Filesystem.getFile(download.contentURL);
            traverseDirectory(file);
        } else {
            Ti.API.info('Download finished but URL is empty.');
        }
    }
}

var addEventListeners = function() {

    if (InAppProducts.getProducts({ SKUs: productIDs })) {
        Ti.API.info('getProducts request started successfully.');
    } else {
        alert('Error: could not start getProducts request!');
    }

    InAppProducts.addEventListener('receivedProducts', function(e) {
        if (e.errorCode) {
            alert('Error: getProducts call failed! Message: ' + e.errorMessage);
        } else {
            if(ti.tables.hasOwnProperty("products")) {
                $.fg.init({
                    columns:2,
                    space:20,
                    gridBackgroundColor:'#000',
                    itemHeightDelta: 0,
                    itemBackgroundColor:'#eee',
                    itemBorderColor:'transparent',
                    itemBorderWidth:0,
                    itemBorderRadius:0
                });
            }

            Ti.API.info('getProducts succeeded!');
            productObjects = e.products;
            Ti.API.info('Product count: ' + productObjects.length);
            ti.tables.products = $.fg;
            buildProductsTable(ti.tables.products, productObjects);
            if (!ANDROID) {
                Ti.API.info("Invalid IDs: " + JSON.stringify(e.invalid));
            }

            $.fg.setOnItemClick(function(e){
                // Let's handle multiple events
                /*if (!etDownload.shouldFire()) {
                    return;
                }*/

                currentProduct = e.source.data.product;
                var appPayload;
                appPayload = 'AppPayloadRandom#' + Math.round(Math.random() * 1000);
                Ti.API.info('Purchasing product ' +
                currentProduct.SKU + ' with app payload ' + appPayload);
                currentProduct.purchase({
                    quantity : 1,
                    applicationPayload: appPayload
                });

            });
        }
        InAppProducts.removeEventListener('receivedProducts', arguments.callee);
    });

    InAppProducts.addEventListener('purchaseUpdate', function(e) {
        Ti.API.info('Received purchaseUpdate event');
        if (e.errorCode) {
            // This only happens on Android. On iOS, there is no error
            // condition associated with the purchaseUpdate event, although
            // the purchase itself may be in PURCHASE_STATE_FAILED state.
            alert('Purchase attempt failed (code: ' + e.errorCode + ')');
        } else {
            Ti.API.info('Product: ' + e.purchase.SKU + ' state: ' + purchaseStateToString(e.purchase.state));
            switch (e.purchase.state) {
                case InAppProducts.PURCHASE_STATE_PURCHASED:
                    // This is a possible state on both iOS and Android
                    //updatePurchaseWindow(e.purchase);
                    //ti.tab.open(ti.windows.purchase);
                    addPurchase(e.purchase.SKU.replace(/UDownloader/g, ""));
                    break;
                case InAppProducts.PURCHASE_STATE_CANCELED:
                    // Android only
                    alert('Purchase canceled.');
                    break;
                case InAppProducts.PURCHASE_STATE_REFUNDED:
                    // Android only
                    break;
                case InAppProducts.PURCHASE_STATE_PURCHASING:
                    // iOS only
                    break;
                case InAppProducts.PURCHASE_STATE_FAILED:
                    // iOS only
                    alert('Purchase failed.');
                    break;
                case InAppProducts.PURCHASE_STATE_RESTORED:
                    // iOS only
                    break;
            }

            if (InAppProducts.autoCompletePurchases === false) {
                // This is for iOS only; autoCompletePurchases is constant
                // true on Android as there is no need/ability to separately
                // complete purchases; they are essentially always
                // auto-completed.
                switch (e.purchase.state) {
                    case InAppProducts.PURCHASE_STATE_PURCHASED:
                    case InAppProducts.PURCHASE_STATE_FAILED:
                    case InAppProducts.PURCHASE_STATE_RESTORED:
                        if (e.purchase.downloads.length) {
                            // Hosted content must be downloaded before the
                            // purchase is completed!
                            Ti.API.info('Purchase has hosted content!');
                            e.purchase.downloads.forEach(function(download) {
                                printDownloadInfo(download);
                            });
                            InAppProducts.startDownloads(e.purchase.downloads);
                        } else {
                            Ti.API.info('Completing purchase...');
                            e.purchase.complete();
                        }
                        break;
                }
            }
        }
        InAppProducts.removeEventListener('purchaseUpdate', arguments.callee);
    });
};

var buildMainWindow = function() {
    $.fgWin.orientationModes = [Ti.UI.PORTRAIT];
};

// close the "purchase"
$.btnPurchaseCancel.addEventListener('click', function() {
    destroy_function();
});

function destroy_function() {
    $.fgWin.close();
    $.fgWin = null;
    args.eventThrottle.setState(true);
    Ti.App.removeEventListener('destroy_activity_window', destroy_function);
}

var init = function() {
    Ti.API.info('Initializing app...');
    buildMainWindow();
    addEventListeners();
    $.fgWin.open();
};

function addPurchase(amount)
{
    var post_url = 'http://s192325.gridserver.com/udownloader/ios/credit.php';
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

init();