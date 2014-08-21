var args = arguments[0]||{};

var price = args.title.replace(' Coins', '');
$.price.text = L('btn_purchase_' + price);
$.money.text = args.title;