//var login={
//	openNewPage: function(tapId,url){
//		document.getElementById(tapId).addEventListener('tap', function() {
//		//打开关于页面
//		console.log(localStorage.token);
//		console.log(plus.storage.getItem('token'));
//		if (localStorage.getItem("token") == '') {
//			var webview = mui.openWindow({
//				//id: tapId,
//				url: url,
//				styles: {
//					//top: '45px',
//					//bottom: '50px',
//					bounce: 'vertical',
//				},
//			});
//		} else {
//			mui.openWindow({
//				url: "login.html"
//			})
//		}
//	});
//	}
//};

function openNewPage(tapId, url) {
	document.getElementById(tapId).addEventListener('tap', function() {
		//打开关于页面
		if (isLogin()) {
			var webview = mui.openWindow({
				url: url,
				styles: {
					top: '45px',
					bottom: '50px',
					bounce: 'vertical',
				},
			});
		} else {
			mui.openWindow({
				url: "login.html"
			})
		}
	});
}

function isLogin() {
	if (localStorage.getItem("token") != null) {
		return true;
	} else {
		return false;
	}
}

function checkUserLogin(token, url) {
	mui.ajax(
		url, {
			type: 'post',
			data: {
				token: token
			},

			success: function(data) {
				return
			},
			error: function(data) {
				return false;
			}
		})

}

function login() {
	mui.openWindow({
		url: "login.html"
	})
}

function getToken() {
	var token = localStorage.getItem('token');
	console.log(token);
	if (token == null) {
		return false
	} else {
		return token;
	}
}