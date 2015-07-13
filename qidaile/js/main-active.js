(function($, qi){
	$.plusReady(function(){
		qi.quitApp();
		mui.back = function() {
			plus.webview.currentWebview().hide();
			var parent = plus.webview.all()[0];
			parent.evalJS("goHome();");	
		};
		mui('#homepage').on('tap', 'li' ,function(){
			var url = qi.apiUrl+this.getAttribute('rel');
			qi.openUrl('show-url.html', 'show-url', {
				gourl: url,
				showtitle: this.getAttribute('title')
			});
//			plus.webview.currentWebview().loadURL(url);
//			qi.openUrl('show-url.html#'+encodeURIComponent(url)+'___'+encodeURIComponent(this.getAttribute('title')), 'show-url');
			return false;
		});
	});
})(mui, QIDAILE);
