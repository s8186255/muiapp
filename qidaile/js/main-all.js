(function($, qi){
	$.plusReady(function(){
		mui.back = function() {
			plus.webview.currentWebview().hide();
			var parent = plus.webview.all()[0];
			parent.evalJS("goHome();");	
		};
		qi.quitApp();
		
		document.getElementById('search').addEventListener('submit', function(ev) {
			
			var keyword = document.getElementById('keyword').value;
			console.log('keyword:'+keyword);
			if(keyword == '') {
//				plus.nativeUI.alert('请输入您想要的物品', undefined, '期待乐');
			} else {
				qi.openUrl('show-all.html', 'show-url', {
					keyword: keyword,
					gourl: null,
					showtitle: null
				});
			}
			ev = ev || window.event; // Event对象
		    if (ev.preventDefault) { // 标准浏览器
		        ev.preventDefault();
		    } else { // IE浏览器
		        window.event.returnValue = false;
		    }
			return false;
		});
		
		mui("#shops").on('tap', 'li', function() {
			plus.nativeUI.showWaiting('加载中...', {
				padlock: true
			});
			qi.openUrl('show-all.html', 'show-url', {
				keyword: null,
				gourl: this.getAttribute('rel'),
				showtitle: this.getAttribute('title')
			});
		});
	});
})(mui, QIDAILE);
