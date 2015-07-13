(function($, qi){
	$.plusReady(function(){
		mui.back = function() {
			console.log('click back');
			back();
		};
		var cur = plus.webview.currentWebview();
		document.getElementById("gohome").addEventListener('tap', function() {
			var parent = plus.webview.all()[0];
			parent.evalJS("goHome();");
//			cur.close();
		});
		
//		document.getElementById('login_btn').addEventListener('tap', function() {
//			var url = qi.apiUrl+this.getAttribute('rel');
//			plus.webview.getWebviewById('sub-page').loadURL(url);
//			return false;
//		});
//		
//		document.getElementById('reg_btn').addEventListener('tap', function() {
//			var url = qi.apiUrl+this.getAttribute('rel');
//			plus.webview.getWebviewById('sub-page').loadURL(url);			
//			return false;
//		});
		
//		var url = location.hash;
//		alert(url);
//		var urls = url.split('#');
//		alert(urls.length);
		var loadWv = plus.webview.getWebviewById('show-url');
		var gourl = loadWv.gourl;
//		alert(gourl);
		if(!gourl) {
			cur.close();
		} else {
//			var strs = urls[urls.length-1].split('___');
//			alert(decodeURIComponent(strs[0]));
//			console.log(decodeURIComponent(strs[0]));
			if(loadWv.showtitle) {
				document.getElementById('url-title').innerHTML = loadWv.showtitle;
			}
//			var ws = mui.preload({
//			    id : 'sub-page',
//				url : gourl,
//			    styles : {
//					top : '44px',
//					bottom : '0px'
//				}
//			});
			var ws = plus.webview.create(gourl, 'sub-page', {
				top : '44px',
				bottom : '0px'
			});
			var showwait = plus.nativeUI.showWaiting('加载中...', {
				padlock: true
			});
			setTimeout(function() {
				plus.nativeUI.closeWaiting();
			}, 5000);
			
			
			ws.onloading = function() {
//				alert('加载中');
				if(!showwait) {
					showwait = plus.nativeUI.showWaiting('加载中...', {
						padlock: true
					});
				}
			}
			ws.onloaded = function() {
				console.log('url:'+ws.getURL());
				var titles = ws.getTitle().split('_');
				var title = titles[0];
				if('' == title) {
					document.getElementById('url-title').innerHTML = '期待乐';
				} else {
					if(title == '用户中心') {
						
						
//						plus.webview.getWebviewById('show-url').close('none');
						var center_webview = plus.webview.getWebviewById('main-center');
						if(center_webview) {
							//alert(titles[1]);
							
							center_webview.evalJS('isLogin("'+titles[1]+'")');
							plus.webview.close('show-url', 'none', 0);
						}
//					} else if(title == '用户登录') {
//						document.getElementById('right-btn').innerHTML = '<a id="reg-btn" class="mui-pull-right" rel="login"  style="color: #FFFFFF;">注册</a>';
//						document.getElementById('url-title').innerHTML = title;
//					} else if('用户注册' == title) {
//						document.getElementById('right-btn').innerHTML = '<a id="login-btn" class="mui-pull-right" rel="login"  style="color: #FFFFFF;">登录</a>';
//						document.getElementById('url-title').innerHTML = title;
					} else {
//						document.getElementById('right-btn').innerHTML = '<a id="gohome" class="mui-icon mui-icon-home mui-pull-right" style="color: #FFFFFF;"></a>'
						document.getElementById('url-title').innerHTML = title;
						var center_webview = plus.webview.getWebviewById('main-center');
						if(center_webview) {
							center_webview.evalJS('checkLogin()');
						}
					}
				}
				plus.nativeUI.closeWaiting();
			}
			
			ws.onerror = function() {
				plus.nativeUI.closeWaiting();
				plus.nativeUI.alert('加载失败', function() {
					mui.back();
				}, '期待乐');
			}
			
			cur.append(ws);
			
			
		}
		
		
	});
})(mui, QIDAILE);

function back() {
	var webview = plus.webview.getWebviewById('sub-page');
	webview.canBack(function(e){
		console.log("canback:"+e.canBack);
		if(!e.canBack) {
			plus.webview.getWebviewById('show-url').close();
//			webview.close();
//			var parent = plus.webview.all()[0];
//			parent.evalJS("goHome();");
		} else {
			webview.back();
		}
	});
}
