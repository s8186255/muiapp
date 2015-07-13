if(plus) {
	var price = document.getElementById('J_FinalPrice').innerText;
	var _ws = plus.webview.getWebviewById('sub-page');
	if(_ws) {
		var cowv = plus.webview.create('_www/src/checkorder.html', 'checkorder', {}, {
			orderUrl: _ws.getURL(),
			orderTitle: _ws.getTitle(),
			price: price
		});
		cowv.show('slide-in-bottom');
	}
}