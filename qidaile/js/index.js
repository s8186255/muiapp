mui.init({
	subpages : [{
		id : './src/main-main.html',
		url : './src/main-main.html'	,
		styles : {
			top : '43px',
			bottom : '51px'
		}
	}]
});
var webcached = {};
var nowId = '';
var hidId = '';
(function($, qi){
	$.plusReady(function(){
		if('setStatusBarStyle' in plus.navigator) {
			plus.navigator.setStatusBarStyle( "UIStatusBarStyleBlackOpaque" );
			plus.navigator.setStatusBarBackground("#fe6407");
		}
//		var mainMv = plus.webview.currentWebview();
		document.addEventListener( "pause", function() {
			console.log('睡眠中:'+plus.os.name);
			if('Android' == plus.os.name) {
				if(nowId) {
					plus.webview.getWebviewById('./src/main-main.html').hide();
				}
				plus.nativeUI.showWaiting('启动中...', {
					width: "1px",
					height: "1px"
				});
//				goHome();
			}
		} );
		document.addEventListener( "resume", function() {
			if('Android' == plus.os.name) {
//				setTimeout(function() {
//					showTab(hidId);
//				}, 200);
//				if(nowId) {
//					plus.webview.getWebviewById('./src/main-main.html').show();
//				}
				plus.nativeUI.closeWaiting();
			}
		} );
		document.getElementById('aboutme').addEventListener('tap', function(){
			mui.openWindow('./src/about.html', 'show-url', {
				scrollIndicator: 'none'
			});
			return false;
		});
		var items = document.getElementsByClassName('mui-tab-item');
		for(var i=0;i<items.length;i++) {
			items[i].addEventListener('tap', function() {
				var id = this.getAttribute('id');
				if (id) {
					if(id == nowId) {
						return false;
					}
					if(id == 'main-main') {
						plus.webview.getWebviewById('./src/main-main.html').show();
						if(nowId) {
							if(webcached[nowId]) {
//								webcached[nowId].hide('slide-out-right', 100);
								webcached[nowId].hide();
							}
//							plus.webview.getWebviewById('./src/main-main.html').evalJs('startSlider()');
							nowId = '';
							document.getElementById('app-title').innerText = this.getAttribute('data-title');
						}
						return false;
					}
//					console.log('open:'+id);
					if(webcached[id] && webcached[id].getURL() != null) {
						document.getElementById('app-title').innerText = this.getAttribute('data-title');
						console.log('cache:'+id);
//						console.log(webcached[id].getURL());
						
						
						if(nowId) {
//							plus.webview.getWebviewById('./src/main-main.html').hide();
							if(webcached[id].No > webcached[nowId].No) {
								if(true || ('Android' == plus.os.name && 0 == webcached[id].First)) {
									webcached[id].show();
									webcached[nowId].hide();
									webcached[id].First = 1;
								} else {
									webcached[id].show('slide-in-right', 100);
									webcached[nowId].hide('slide-out-left', 100);
								}
							} else {
								if(true || ('Android' == plus.os.name && 0 == webcached[id].First)) {
									webcached[id].show();
									webcached[nowId].hide();
									webcached[id].First = 1;
								} else {
									webcached[id].show('slide-in-left', 100);
									webcached[nowId].hide('slide-out-right', 100);
								}
							}
							
						} else {
//							plus.webview.getWebviewById('./src/main-main.html').evalJs('stopSlider()');
							if(true || ('Android' == plus.os.name && 0 == webcached[id].First)) {
								
								webcached[id].show('none');
//								if(id == 'main-list' && webcached[id].First ==0) {
//									webcached['id'].evalJS('_init()');
//								}
								webcached[id].First = 1;
							} else {
								webcached[id].show('slide-in-right', 100);
							}
						}
						//./src/main-main.html
						nowId = id;
						
					} else {
						
						var webview = plus.webview.getWebviewById('id');
						if(!webview) {
							console.log('./src/'+id+'.html#'+QIDAILE.username);
							webview = plus.webview.create('./src/'+id+'.html', id, {
								top : '43px',
								bottom : '51px'
							});
						}
						webcached[id] = webview;
//						plus.nativeUI.showWaiting('加载中...');
//						if(id == 'main-center') {
//							webcached[id].evalJS('isLogin("'+QIDAILE.username+'")');
//						}
						webcached[id].show();
						var title = this.getAttribute('data-title');
						webcached[id].onloaded = function() {
							
							document.getElementById('app-title').innerText = title;
							if(nowId) {
								webcached[nowId].hide();
							}
							nowId = id;
//							plus.nativeUI.closeWaiting();
						}
						
						
					}
//						console.log(webview);
					return false;
				}
			});
			if(i > 0) {
				var nid = items[i].getAttribute('id');
//				console.log(nid+" create");
				var webview = plus.webview.create('./src/'+nid+'.html', nid, {
					top : '43px',
					bottom : '51px'
				}, {No: i, First: 0});
//					webview.show();
//				mainMv.append(webview);
				webcached[nid] = webview;
			}
		}
		window.setTimeout(function() {
//				console.log("add listner");
//			plus.navigator.closeSplashscreen();
			var wv = plus.webview.getWebviewById('./src/main-main.html');
			if(wv) {
				wv.show();
				window.setTimeout(function() {
					console.log("close listener 1");
					plus.navigator.closeSplashscreen();
				}, 2000);
				wv.addEventListener('loaded', function() {
					wv.evalJS('initMain()');
					window.setTimeout(function() {
						console.log("close listener 2");
						plus.navigator.closeSplashscreen();
					}, 200);
				});
			} else {
				window.setTimeout(function() {
					console.log("close listener 3");
					plus.navigator.closeSplashscreen();
				}, 1000);
			}
		}, 300);
		
//		qi.pushMessage();
		
//		plus.webview.currentWebview().onloaded = function() {
			
//		}
		
	});
})(mui, QIDAILE);

function showTab(id) {
	if(id) {
		nowId = id;
		var cName = 'mui-active';
		var elements = document.getElementById(nowId);
		elements.className += ' '+cName;
		var home = document.getElementById('main-main');
		home.className = elements.className.replace( new RegExp( "(\\s|^)" + cName + "(\\s|$)" )," " ); 
		plus.webview.getWebviewById(nowId).show();
		document.getElementById('app-title').innerText = elements.getAttribute('data-title');
	}
}

function goHome() {
	if(nowId) {
		var cName = 'mui-active';
		var elements = document.getElementById(nowId);
		elements.className = elements.className.replace( new RegExp( "(\\s|^)" + cName + "(\\s|$)" )," " ); 
		var home = document.getElementById('main-main');
		home.className += ' '+cName;
		plus.webview.getWebviewById(nowId).hide();
		document.getElementById('app-title').innerText = '期待乐';
		nowId = '';
	}
	var webview = plus.webview.getWebviewById('sub-page');
	if(webview) {
		var pweb = plus.webview.getWebviewById('show-url');
		if(pweb) {
			pweb.close();
		}
		webview.close();
		flag = 1;
	} else {
		webview = plus.webview.getWebviewById('show-url');
		if(webview) {
			webview.close();
			flag = 1;
		}
	}
}
