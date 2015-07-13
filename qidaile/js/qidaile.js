var QIDAILE = {
	isready : 0,
	xhr : null,
	token: null,
	isReady: function() {
		this.isready = 1;
	},
	checkNetwork: 0,
	username: '',
	network: null,
	
	apiUrl : 'http://app.qidaile.com/',
	staticUrl: 'http://qn.cdn.qidaile.cn/',
	path: '',
	
	init: function(apiUrl) {
		if(apiUrl) {
			this.apiUrl = apiUrl;
		}
	},
	
	getApiUrl: function() {
		var path =  this.apiUrl+'?path='+this.path	;
		console.log(path);
		return path;
	},
	
	openUrl: function(url, id, params) {
		mui.openWindow(url, id, {
			show: {
				duration: 200
			},
			extras: params|| {},
			waiting:{
  				autoShow:false,
  				padlock: true
  			}
		});	
	},
	
	apiSend: function(method, url, params, callback, type, wait) {
		if(!this.checkNetwork) {
			var network = plus.networkinfo.getCurrentType();
			if(network < 2) {
				plus.nativeUI.toast('您的网络未连接,建议在wifi情况下浏览。', undefined, '期待乐');
			} else {
				this.checkNetwork = 1;
				this.network = network;
				this._apiSend(method, url, params, callback, type);
			}
		} else {
			this._apiSend(method, url, params, callback, type, wait);
		}
	},
	
	_apiSend: function(method, url, params, callback, type, wait) {
		if(wait === undefined) {
			wait = true;
		}
		if(wait) {
			var waitTitle = '加载中...';
			if('waitTitle' in params) {
				waitTitle = params.waitTitle;
				delete params.waitTitle;
			}
			plus.nativeUI.showWaiting(waitTitle, {
				padlock: true
			});
		}
		var self = this;
		params = params || {};
//		params.ajax = 1;
		
		mui.ajax(url, {
			headers: {
				'APP_UUID': plus ? plus.device.uuid : '',
				'PLATFORM': plus ? plus.os.name : ''
			},
			data: params,
			dataType: type,//服务器返回json格式数据
			type: method,//HTTP请求类型
			timeout: 5000,//超时时间设置为10秒；
			success:function(data){
				//服务器返回响应，根据响应结果，分析是否登录成功；
				//console.log(data);
				if(wait) {
					plus.nativeUI.closeWaiting();
				}
//				alert(data);
//				alert("type:"+typeof(callback));
				if(callback && callback['success']) {
					callback['success'].call(self, data);
				}
			},
			error:function(xhr,type,errorThrown){
				//异常处理；
				console.log(type+'_'+method+'_'+url);
				if(wait) {
					plus.nativeUI.closeWaiting();
				}
//				plus.nativeUI.toast('加载失败,可能网络已断开.', undefined, '期待乐');
				if(callback && callback['error'] && typeof callback['error'] == 'function') {
					console.log('callback');
					callback['error']();
				} else {
					plus.nativeUI.alert('网络请求超时,请稍后再试', undefined, '期待乐')
				}
//				mui.back();
			}
		});
	},
	quitApp: function(callback) {
		document.addEventListener( "netchange", function() {
			var network = plus.networkinfo.getCurrentType();
			if(network < 2) {
				if(this.network > 1) {
					plus.nativeUI.toast('您的网络已断开', undefined, '期待乐');
				}
			}
			
			if(this.network == 3 && network > 3) {
				plus.nativeUI.toast('您网络已从wifi切换到蜂窝网络，浏览会产生流量', undefined, '期待乐', '我知道了');
			}
			
			this.network = network;
		});
		var first = null;
		plus.key.addEventListener('backbutton', function(){
			if(callback) {
				callback();
			} else {
				//首次按键，提示‘再按一次退出应用’
				var cowv = plus.webview.getWebviewById('checkorder');
				if(cowv) {
					cowv.close();
					return false;
				}
				if(!first){
					var flag = 0;
					var webview = 
					webview = plus.webview.getWebviewById('show-url');
					if(webview) {
						flag = 1;
						webview.canBack(function(e){
							console.log("canback:"+e.canBack);
							if(!e.canBack) {
								webview.close();
							} else {
								webview.back();
							}
						});
					}
					
					if(flag) {
						return ;
					}
					first = new Date().getTime();
					mui.toast('再按一次退出应用');
					setTimeout(function(){
						first = null;
					},1000);
				}else{
					if(new Date().getTime()-first<1000){
						plus.runtime.quit();
					}
				}
			}
		}, false);
	},
	pushMessage: function() {
		plus.push.createMessage('我是一个消息', '我是一个消息扩展', {
			title: '免息来拿',
			cover: false
		});
		plus.push.addEventListener( "click", function ( msg ) {
			// 分析msg.payload处理业务逻辑 
			alert( "You clicked: " + msg.content ); 
		}, false ); 
	}
}
