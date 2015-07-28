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
				console.log(localStorage.token);
				console.log(plus.storage.getItem('token'));
				if (localStorage.getItem("token") == '') {
					var webview = mui.openWindow({
						//id: tapId,
						url: url,
						styles: {
							//top: '45px',
							//bottom: '50px',
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
