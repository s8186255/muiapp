var isClose = false;
var price = 0;
(function($, qi){
	$.plusReady(function(){
		mui.back = function() {
			console.log('click back');
			back();
		};
		var cur = plus.webview.currentWebview();
		document.getElementById("gohome").addEventListener('tap', function() {
			cur.close();
		});
		
		var ws = null;
		var cowv = null;
		
		var quickBuy = document.getElementById('allBuyBtn');
		var loadWv = plus.webview.getWebviewById('show-url');
		var buyHandler = function() {
			var _ws = plus.webview.getWebviewById('sub-page');
			if(_ws) {
				var url = _ws.getURL();
				
				console.log(url);
				if(noHas(url)) {
					plus.nativeUI.toast('请进入商品详细页进行分期');
					return false;
				}
				if(url.indexOf('etao') > 0) {
					_ws.appendJsFile('_www/js/getPrice.js');
//					var price = 0;
//					_ws.evalJS('var price = (document.getElementById("J_FinalPrice").innerText); alert(parent);');
				} else {
					cowv = plus.webview.create('checkorder.html', 'checkorder', {}, {
						orderUrl: url,
						orderTitle: _ws.getTitle()
					});
					cowv.show('slide-in-bottom');
				}
			} else {
				plus.nativeUI.alert("请输你您想要的商品", undefined, '期待乐');
			}
		}
		quickBuy.addEventListener('tap', buyHandler);
		
		
		var gourl = loadWv.gourl;
		if(gourl) {
			loadWv.gourl = null;
		}
		var keyword = loadWv.keyword;
		if(keyword) {
			loadWv.keyword = null;
		}
		if(!gourl && !keyword) {
			cur.close();
		} else {
			if(keyword) {
				gourl = 'http://m.etao.com/search/search.php?q='+encodeURIComponent(keyword);
			}
			document.getElementById('url-title').innerHTML = loadWv.showtitle || keyword+' - 全网分期' || gourl;
//			ws = mui.preload({
//			    id : 'sub-page',
//				url : gourl,
//			    styles : {
//					top : '44px',
//					bottom : '51px'
//				}
//			});

			ws = plus.webview.create(gourl, 'sub-page', {
				top : '44px',
				bottom : '49px'
			});
			
			var showwait = plus.nativeUI.showWaiting('加载中...', {
				padlock: true
			});
			setTimeout(function() {
				plus.nativeUI.closeWaiting();
			}, 5000);
			
			ws.onloading = function() {
				showwait = plus.nativeUI.showWaiting('加载中...', {
					padlock: true
				});
			}
			ws.onloaded = function() {
				var title = ws.getTitle();
				if(title == '用户登录') {
					isClose = true;
					document.getElementById('qidail_footer').style.display = 'none';
				} else if(title == '确认订单') {
					isClose = true;
					document.getElementById('qidail_footer').style.display = '';
					quickBuy.removeEventListener('tap', buyHandler);
					quickBuy.addEventListener('tap', function() {
						ws.evalJS('sendOrder();');
						document.getElementById('qidail_footer').style.display = 'none';
					});
					var center_webview = plus.webview.getWebviewById('main-center');
					if(center_webview) {
						center_webview.evalJS('checkLogin()');
					}
				}
				document.getElementById('url-title').innerHTML = title;
				plus.nativeUI.closeWaiting();
			}
			
			ws.onerror = function() {
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('加载失败，可能网络已断开', function() {
//					mui.back();
					cur.close();
				}, '期待乐');
			}
			
			cur.append(ws);
		}
	});
})(mui, QIDAILE);

function noHas(url) {
	var items = {
		'etao': 'item',
		'jd.com' : 'item.m.jd.com',
		'taobao.com': 'detail.htm',
		'tmall.com': 'detail.m.tmall.com',
		'suning.com': 'suning.com/product/',
		'gome.com.cn': 'gome.com.cn/product',
		'mi.com': '/product/',
		'vmall': 'product',
		'yhd.com': 'item|detail',
		'amazon': '/gp/'
		
	};
	for(var key in items) {
		if(url.indexOf(key) >=0) {
			var words = items[key].split('|');
			for(var k in words) {
				if(url.indexOf(words[k]) > 0) {
					return false;
				}
			}
			return true;
		}
	}
	
	return false;
}

function back() {
	var webview = plus.webview.getWebviewById('sub-page');
	if(isClose) {
		plus.webview.getWebviewById('show-url').close();
		return ;
	}
	webview.canBack(function(e){
		console.log("canback:"+e.canBack);
		if(!e.canBack) {
			plus.webview.getWebviewById('show-url').close();
		} else {
			webview.back();
		}
	});
}

function showOrder(price) {
	alert("get:"+price);
}
