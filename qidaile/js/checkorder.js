var cur;
(function($, qi){
	$.plusReady(function(){
		console.log("plus ready");
		cur = plus.webview.currentWebview();
		var url = cur.orderUrl;
		var title = cur.orderTitle;
		document.getElementById('title').innerHTML = title;
		document.getElementById('url').innerHTML = url;
		document.getElementById('buyBtn').addEventListener('click', function(){
			sendPrice(1);
		});
		var priceElem = document.getElementById('price');
		
		priceElem.addEventListener('blur', function(){
			sendPrice(0);
		});
		
		document.getElementById('firstpay').addEventListener('blur', function(){
			sendPrice(0);
		});
		document.getElementById('monthNum').addEventListener('change', function(){
			sendPrice(0);
		});
		if(cur.price) {
			priceElem.value = cur.price;
			getMonthPrice(cur.price, 0, 10);
		} else {
			getPrice(url);
		}
		
		
	});
})(mui, QIDAILE);


function my_back() {
	if(!window.plus) {
		return;
	}
	plus.webview.currentWebview().close();
}

function getPrice(url) {
	url = url || document.getElementById('url').innerHTML;
	QIDAILE.apiSend('GET', QIDAILE.apiUrl+'pub/getPrice.qi', {
		url: url,
		waitTitle: '获取价格中...'
	}, {
		success: function(data) {
			if(data && data.price > 0) {
				document.getElementById('price').value = data.price;
				if('url' in data) {
					document.getElementById('url').innerHTML = data.url;
					cur.orderUrl = data.url;
				}
				if('title' in data) {
					document.getElementById('title').innerHTML = data.title;
					cur.orderTitle = data.title;
				}
				
				if('url' in data) {
					document.getElementById('url').innerHTML = data.url;
					cur.orderUrl = data.url;
				}
				
				if(data.month > 0) {
					var option = '';
					for(var i=1; i<=data.month; i++) {
						if(i == data.month) {
							option += '<option value="'+i+'" selected="selected"">'+i+' 期</option>';
						} else {
							option += '<option value="'+i+'">'+i+' 期</option>';
						}
						
					}
					document.getElementById('monthNum').innerHTML = option;
					getMonthPrice(data.price, 0, data.month);
				}
			} else {
		//		plus.nativeUI.alert("获取价格失败，请确保这是一个正确的商品页，然后填上正确的价格和相关信息.", undefined, "期待乐");
			}
		}
	}, 'json');
}

function getMonthPrice(sellprice, pay, month) {
	QIDAILE.apiSend('GET', QIDAILE.apiUrl+'pub/price.qi?sellprice='+sellprice+'&pay='+pay+'&month='+month, {}, {
		success: function(data) {
			document.getElementById('payment').innerHTML = data.data+' 元 x ' + month + ' 期';
		}, 
		error: function(data) {
			alert(data);
		}
	}, 'json');
}

function sendPrice(flag) {
	if(!window.plus) {
		return;
	}
	var cur = plus.webview.currentWebview();
	var sellprice = document.getElementById('price').value;
	sellprice = parseInt(sellprice);
	if(isNaN(sellprice) || sellprice < 10 ) {
		if(flag) {
			plus.nativeUI.alert('请输入正确的价格', undefined, '期待乐');
			document.getElementById('price').focus();
		}
		return false;
	}
	var month = document.getElementById('monthNum').value;
	month = parseInt(month);
	if( month < 1 ) {
		if(flag) {
			plus.nativeUI.alert('请选择分期月数', undefined, '期待乐');
		}
		return false;
	}
	var pay = document.getElementById('firstpay').value;
	pay = parseInt(pay);
	if(flag) {
		var ourl = cur.orderUrl;
		var otitle = cur.orderTitle;
		var url = QIDAILE.apiUrl + 'center/checkorder.qi?attrids=';
		url += encodeURIComponent(ourl)+'&sellprice='+sellprice+'&pay='+pay+'&month='+month+'&attrinfo='+encodeURIComponent(otitle);
		console.log(url);
		cur.close();
		var subWv = plus.webview.getWebviewById('sub-page');
		subWv.loadURL(url);
		return ;
	}
	
	getMonthPrice(sellprice, pay, month);
	
	return false;
}
