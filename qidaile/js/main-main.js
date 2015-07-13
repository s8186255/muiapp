var gallery = mui('.mui-slider');
startSlider();

function stopSlider() {
	gallery.slider({
	  interval:0     //自动轮播周期，若为0则不自动播放，默认为0；
	});
}

function startSlider() {
	gallery.slider({
	  interval:5000    //自动轮播周期，若为0则不自动播放，默认为0；
	});
}

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
			initMain($, qi, true, function(){
				wv.endPullToRefresh();
			});
			
		});
		var first = null;
		qi.quitApp();
		
		mui('#homepage').on('tap', 'a' ,function(){
			var url = qi.apiUrl+this.getAttribute('href');
			plus.nativeUI.showWaiting('加载中...');
			qi.openUrl('show-url.html', 'show-url', {
				gourl: url,
				showtitle: this.getAttribute('title')
			});
			return false;
		});
		mui('#homepage').on('tap', 'li' ,function(){
			var url = qi.apiUrl+this.getAttribute('rel');var key = this.getAttribute('key');
			if(key) {
				url += encodeURIComponent(key);
			}
			plus.nativeUI.showWaiting('加载中...');
			qi.openUrl('show-url.html', 'show-url', {
				gourl: url,
				showtitle: this.getAttribute('title')
			});
			return false;
		});
		
		
	});
})(mui, QIDAILE);

function initMain($, qi, wait, callback) {
	$ = $ || mui;
	qi = qi || QIDAILE;
	wait = wait || false;
	callback = callback || false;
	qi.apiSend('GET', qi.apiUrl+'?', {}, {
		success: function(data) {
			if(typeof callback == 'function') {
				callback();
			}
			
			if(!data || data.code || !data.recommends) {
				return false;
			}
			var goodslist = data.recommends[1];
			var html = '';
			for(var key in goodslist) {
				var className = 'fr';
				if(key % 2 == 0) {
					className = 'fl';
				}
				html += '<li class='+className+' rel="'+goodslist[key].murl+'" title="'+goodslist[key].title+'"><span><img src="'+QIDAILE.staticUrl+'/all/'+goodslist[key].mimg+'" width="100%" height="auto" alt=""></span>';
                html += '<h3>'+goodslist[key].title+'</h3><div class="yuegong">';
                html += '<p class="left">月供:</p><p class="right">￥'+goodslist[key].monthprice+'</p></div></li>';
			}
//			console.log(html);
			
			document.getElementById('hotlist').innerHTML = html;
			var parent = plus.webview.all()[0];
			parent.evalJS("QIDAILE.username='"+data.username+"'");
			plus.webview.getWebviewById('main-center').evalJS('isLogin("'+data.username+'")');
		},
		error: callback
	}, 'json', wait);
}
