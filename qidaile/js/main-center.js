var username = null;
(function($, qi){
	$.plusReady(function(){
		mui.back = function() {
			plus.webview.currentWebview().hide();
			var parent = plus.webview.all()[0];
			parent.evalJS("goHome();");	
		};
		mui('#user_contorl').on('tap', 'li' ,function(){
			var url = qi.apiUrl+this.getAttribute('rel');
//			plus.webview.currentWebview().loadURL(url);
			if(username) {
				var title = this.getAttribute('title');
			} else {
				title = "用户登录";
			}
			plus.nativeUI.showWaiting('加载中...', {
				padlock: true
			});
			qi.openUrl('show-url.html', 'show-url', {
				gourl: url,
				showtitle: title
			});
//			qi.openUrl('show-url.html#'+encodeURIComponent(url)+'___'+encodeURIComponent(title), 'show-url');
			return false;
		});
//		checkLogin();
		document.getElementById('login_btn').addEventListener('tap', function() {
			var url = qi.apiUrl+this.getAttribute('rel');
//			plus.webview.currentWebview().loadURL(url);
			qi.openUrl('show-url.html', 'show-url', {
				gourl: url,
				showtitle: this.getAttribute('title')
			});
			return false;
		});
//		mui("#login_btn").on('tap', function() {
//			var url = qi.apiUrl+this.getAttribute('rel');
////			plus.webview.currentWebview().loadURL(url);
//			qi.openUrl('show-url.html', 'show-url', {
//				gourl: url,
//				showtitle: this.getAttribute('title')
//			});
//			return false;
//		});
		
		document.getElementById('reg_btn').addEventListener('tap', function() {
			var url = qi.apiUrl+this.getAttribute('rel');
//			plus.webview.currentWebview().loadURL(url);
			qi.openUrl('show-url.html', 'show-url', {
				gourl: url,
				showtitle: this.getAttribute('title')
			});
			return false;
		});
		
		document.getElementById('loginout_btn').addEventListener('tap', function() {
			console.log('login out');
			
			QIDAILE.apiSend('GET', QIDAILE.apiUrl+'logout?', {}, {
				success: function() {
					isLogin('');
				}
			}, 'json');
			return false;
		});
		
//		plus.webview.currentWebview().loadURL(qi.apiUrl+'/center');
		
//		mui.openWindow('show-url.html#'+qi.apiUrl+'/center'+'|||用户中心', 'show-url');
//		var webview = mui.openWindow(qi.apiUrl+'center', 'user_center', {
//			top: '48px'
//		});
//		plus.webview.currentWebview().onloaded = function() {
//			plus.webview.all()[0].evalJs("document.getElementById('app-title').innerText ='"+webview.getTitle()+"'");
//		}
	});
})(mui, QIDAILE);

function checkLogin() {
	if(username) {
		isLogin(username);
		return;
	}
	console.log("check login");
	QIDAILE.apiSend('GET', QIDAILE.apiUrl+'userinfo?', {}, {
		success: function(data){
			console.log("username:"+data.username);
			isLogin(data.username);
		}
	}, 'json', false);
}

function isLogin(name) {
	console.log("login:"+name);
	username = name;
	if('' == name) {
		document.getElementById('loginout').style.display = 'none';
		document.getElementById('islogin').style.display = 'none';
		document.getElementById('needlogin').style.display = '';
	} else {
		document.getElementById('username').innerText = 'Hi,'+name;
		document.getElementById('islogin').style.display = '';
		document.getElementById('loginout').style.display = '';
		document.getElementById('needlogin').style.display = 'none';
	}
}
