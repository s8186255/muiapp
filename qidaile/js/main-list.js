(function($, qi){
	$.plusReady(function(){
		var wv = plus.webview.currentWebview();
		wv.setPullToRefresh({support:true,
			height:"50px",
			range:"200px",
			contentdown:{
				caption:"下拉可以刷新"
			},
			contentover:{
				caption:"释放立即刷新"
			},
			contentrefresh:{
				caption:"正在刷新..."
			}
		},function() {
			initMain($, qi, true, function() {
				wv.endPullToRefresh();
			});
		});
		qi.quitApp();
		mui.back = function() {
			plus.webview.currentWebview().hide();
			var parent = plus.webview.all()[0];
			parent.evalJS("goHome();");	
			
		};
		mui('#columnlist').on('tap', 'li' ,function(){
			var url = this.getAttribute('rel');
			plus.nativeUI.showWaiting('加载中...');
			console.log(url);
			qi.openUrl('show-url.html', 'show-url', {
				gourl: url,
				showtitle: this.getAttribute('title')
			});
//			plus.webview.currentWebview().loadURL(url);
//			qi.openUrl('show-url.html#'+encodeURIComponent(url)+'___'+encodeURIComponent(this.getAttribute('title')), 'show-url');
			return false;
		});
		wv.onloaded = function() {
			initMain($, qi, false, function() {});
		}
//		initMain($, qi, false, function() {});
//		window.setTimeout(function() {
//			initMain($, qi, false, function() {});
//		}, 1000);
	});
})(mui, QIDAILE);

function _init() {
	initMain($, qi, true, function() {
		
	});
}


function initMain($, qi, wait, callback) {
	qi.apiSend('GET', qi.apiUrl+'?', {}, {
		success: function(data) {
			if(callback) {
				callback();
			}
			
			if(!data || data.code || !data.columnList) {
				return ;
			}
			var columnList = data.columnList;
			var html = '';
			for(var key in columnList) {
				html += '<li rel="'+qi.apiUrl+'column/'+columnList[key].ename+'.qi" title="'+columnList[key].name+'"><img width="100%" height="auto" src="../images/style/'+columnList[key].ename+'.jpg"><br /><p>'+columnList[key].name+'</p></li>';
			}
//			console.log(html);
			document.getElementById('columnlist').innerHTML = html;
			
		},
		error: callback
	}, 'json');
		
		
}
