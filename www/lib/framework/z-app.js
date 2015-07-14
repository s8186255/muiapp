/**
 * 基于Webview对象构建的App思路
 * 1. webview 对象池(数量, 一般为 8-12 个, 
 * 	  1个mainLayout(Home),
 *    1个main或若干个(3,4,5)tab,
 *    1个listLayout(带下拉刷新),
 *    1个list,
 *    1个detailLayout(不带下拉刷新),
 *    1个detail,
 *    1个contentLayout(不带下拉刷新)
 *   )
 * 
 * 2. 各种API设计
 *    - 打开tab
 *      App.openTab('id,url')
 *    - 打开list
 *      App.openList(url, {
 * 	        title : '',
 * 	        categories : [ {text:'',value:''}, {text:'',value:''} ],
 *          buttons : [ {text:'',value:''}, {text:'',value:''} ],
 *          extras : { }
 *      })
 *    - 打开detail
 *      App.openDetail(url, {
 * 	        title : '',
 *          buttons : [ {text:'',value:''}, {text:'',value:''} ],
 *          extras : {}
 *      })
 *    - 打开content
 *      App.openContent(url, {
 * 	        title : '',
 *          buttons : [ {}, {} ],
 *          extras : {}
 *      })
 */
var App = (function(mui){
	// 设备网络状态常量
	var NET_TYPES = ["状态未知","未连接网络","有线网络","无线WIFI网络","蜂窝移动2G网络","蜂窝移动3G网络","蜂窝移动4G网络"];
	// 默认配置参数 注意不能等于null
	var default_opts = {
		init : {
			isMainView : false,//当前页面是否是APP主页面
			viewid : '',//主页面的ID值, 仅当isMainView=true时有效
			statusBar : {
				background : '#f7f7f7',//设备顶部状态栏背景颜色
				highlight : false//设备顶部状态栏文字是否高亮(白色)
			},
		},
	};
	
	this.main = {
		openedTab : '',
		tabs : [],
	};
	var _this = this;
	 
	this.opts = default_opts;
	
//	window.addEventListener('click', function(e){
//		var tgt = e.target;
//		if (tgt.nodeName == 'A') {
//			e.preventDefault();
//		}
//	});
	
	window.addEventListener('onNotify', function(e){
		e.app = _this;
		var detail = e.detail;
		if (detail.notifyTo) {
			_this[detail.notifyTo](e);
		} else if (_this.events.view) {
			_this.events.view.onNotify(e);
		}
	});
	
	/**
	 * 0. 处理MUI初始化	App.handleMuiInit
	 * 1. 处理设备准备	App.handleDeviceReady
	 * 2. 处理初始化		App.handleInit
	 * 3. 处理事件绑定	App.handleEvents
	 * 4. 处理拦截器		App.handleInterceptor
	 * 5. 处理模板渲染	App.handleTemplate
	 * 6. 处理APP准备	App.handleAppReady
	 */
	this.go = function(opts){
		var options = opts || {};
		options.init = options.init || {};
		handleMuiInit(options);
		
		mui.plusReady(function() {
			// 当前设备操作系统名称
			this.os = plus.os.name.toLowerCase();
			_this.currentView = plus.webview.currentWebview();
			// 1. 触发deviceReady
			_this.handleDeviceReady(options);
			// 2.初始化, 此处很有可能会进行一些视图的创建
			_this.handleInit(options);
			// 3.准备事件监听
			_this.handleEvents();
			// 4. 执行拦截器
			_this.handleInterceptor(function(){
				if (typeof _this.pause == 'undefined' || _this.pause == true ) {
					_this.pause = false;
//					alert('continue of -> ' + plus.webview.currentWebview().getURL());
					// 5. 处理template,扫描当前页面的script标签
					_this.handleTemplate();
					// 6. 第6点在第5点里面处理
				}
			});
		});
	}
	
	this.handleMuiInit = function(options) {
		var pullRefresh;
		var init = options.init;
		if (init.pullRefresh && ( 
			  init.pullRefresh.down == true || init.pullRefresh.up == true 
			  || (init.pullRefresh.down && typeof init.pullRefresh.down == 'object')
			  || (init.pullRefresh.up && typeof init.pullRefresh.up == 'object')
		    )
		) {
			pullRefresh = {};
			pullRefresh.container = "#refreshContainer";
			
			if (init.pullRefresh.down && ( init.pullRefresh.down == true || typeof init.pullRefresh.down == 'object') ) {
//				if (typeof init.pullRefresh.down == 'object' && (!init.pullRefresh.down.hasMore || typeof init.pullRefresh.up.hasMore == 'undefined') ) {
//					throw "init.pullRefresh.down.hasMore required";
//				}
//				if (typeof init.pullRefresh.down == 'object' && typeof init.pullRefresh.down.hasMore != 'function') {
//					throw "init.pullRefresh.down.hasMore must be a function";
//				}
				// 下拉刷新
				pullRefresh.down = {
					contentdown : init.pullRefresh.down.contentdown || "pull down can refresh",
					contentover : init.pullRefresh.down.contentover || "release to refresh",
					contentrefresh : init.pullRefresh.down.contentrefresh || "refresh...",
					callback : function(e){
						// 重新处理模板渲染
						var _this = this;
						App.handleTemplate({ 
							reload : true, 
							beforeDefined : function(tpl) {
								if (init.pullRefresh.down.beforeDefined) {
									init.pullRefresh.down.beforeDefined(tpl);
								}
							},
							beforeAjax : function(tpl){
								if (init.pullRefresh.down.beforeAjax) {
									init.pullRefresh.down.beforeAjax(tpl);
								}
								tpl.pullRefresh.up = false;
								tpl.pullRefresh.down = true;
							},
							ajaxSuccess : function(tpl) {
								mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
							},
							ajaxError : function() {
								mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
							}
						});
					}
				}
			}
			
			if (init.pullRefresh.up && ( init.pullRefresh.up == true || typeof init.pullRefresh.up == 'object') ) {
//				if (typeof init.pullRefresh.up == 'object' && (!init.pullRefresh.up.hasMore || typeof init.pullRefresh.up.hasMore == 'undefined') ) {
//					throw "init.pullRefresh.up.hasMore required";
//				}
//				if (typeof init.pullRefresh.up == 'object' && typeof init.pullRefresh.up.hasMore != 'function') {
//					throw "init.pullRefresh.up.hasMore must be a function";
//				}
				// 上拉加载更多
				pullRefresh.up = {
					contentrefresh : init.pullRefresh.up.contentrefresh || "loading...",
					contentnomore : init.pullRefresh.up.contentnomore || 'no more',
					callback : function () {
						// 重新处理模板渲染, 追加内容到现有内容上去
						var _this = this;
						App.pullup = _this;
						App.handleTemplate({ 
							append : true, 
							beforeDefined : function(tpl) {
								if (init.pullRefresh.up.beforeAjax) {
									init.pullRefresh.up.beforeAjax(tpl);
								}
							},
							beforeAjax : function(tpl){
								if (init.pullRefresh.up.beforeAjax) {
									init.pullRefresh.up.beforeAjax(tpl);
								}
								tpl.pullRefresh.up = true;
								tpl.pullRefresh.down = false;
							},
							ajaxSuccess : function(tpl) {
								var hasMore = true;
								if (init.pullRefresh.up == true) {
									var result = tpl.ajax.result;
									hasMore = result && result.data ;
								} else if (typeof init.pullRefresh.up.hasMore == 'function'){
									hasMore	= init.pullRefresh.up.hasMore(tpl);
								}
								 
								_this.endPullupToRefresh(!hasMore);
							},
							ajaxError : function() {
								_this.endPullupToRefresh(false);
							}
						});
					}
				}
			}
		}
		
		mui.init({
			swipeBack : false,
			keyEventBind : {
				backbutton : false,
				menubutton : false
			},
			pullRefresh : pullRefresh
		});
		_this.pullRefresh = pullRefresh;
	}
	
	this.handleInit = function(options) {
		var init = options.init;
		// 主页面
		if (init.isMainView) {
			// 全局共享
			if (init.http && typeof init.http != 'undefined') {
				plus.storage.setItem('http_opts', _this.stringify(init.http));
			}
			if (init.login && typeof init.login != 'undefined') {
				plus.storage.setItem('login_opts', _this.stringify(init.loign));
			}
			
			// 开发者自己决定是否要关闭启动界面
			if (init.splashscreen && init.splashscreen.autoclose == false) {
			} else {
				plus.navigator.closeSplashscreen();
			}
			
			// 若是主页面,则需要初始化webview对象池
			// 处理视图
			if (init.views && typeof init.views != 'undefined') {
				var views = init.views;
				var main = views.main;
				if (main.url && typeof main.url != 'undefined') {
					var mainView = _this.createWebview(main.url,'main-view',main.styles,main.extras);
					plus.webview.currentWebview().append(mainView);
				}
				
//				var menu = views.menu;
//				if (typeof menu != 'undefined') {
//					var menuView = _this.createWebview(menu.url, 'menu-view',menu.styles,menu.extras);
//					_this.menuview = menuView;
//				}
				
				var content = views.content;
				if (typeof content != 'undefined') {
					content.extras = content.extras || {};
					content.extras.preload = true;
					
					var layout = content.layout;
					layout.extras = layout.extras || {};
					layout.extras.preload = true;
					var contentLayoutView = _this.createWebview(layout.url,'content-layout-view',layout.styles,layout.extras);
					var contentView = _this.createWebview(content.url, 'content-view',content.styles,content.extras);
					contentLayoutView.append(contentView);
					_this.content = contentView;
				}
				
				var list = views.list;
				if (typeof list != 'undefined') {
					list.extras = list.extras || {};
					list.extras.preload = true;
					
					var layout = list.layout;
					layout.extras = layout.extras || {};
					layout.extras.preload = true;
					var listLayoutView = _this.createWebview(layout.url,'list-layout-view',layout.styles,layout.extras);
					
					var category = layout.category;
					if (typeof category != 'undefined') {
						// 创建tab页面
						category.styles = category.styles || {
							height : '48px',
							left : '48px',
							right : '48px',
							scrollIndicator : 'none',
						};
						category.extras = category.extras || {};
						category.extras.preload = true;
						category.extras.notifyTo = category.notifyTo;
						var cateView = _this.createWebview(category.url, 'layout-category-view', category.styles, category.extras)
						listLayoutView.append(cateView);
					}
					
					var listView = _this.createWebview(list.url, 'list-view',list.styles,list.extras);
					listLayoutView.append(listView);
					_this.list = listView;
				}
				
				var detail = views.detail;
				if (typeof detail != 'undefined') {
					detail.extras = detail.extras || {};
					detail.extras.preload = true;
					
					var layout = detail.layout;
					layout.extras = layout.extras || {};
					layout.extras.preload = true;
					var detailLayoutView = _this.createWebview(layout.url,'detail-layout-view',layout.styles,layout.extras);
					
					var detailView = _this.createWebview(detail.url, 'detail-view',detail.styles,detail.extras);
					detailLayoutView.append(detailView);
					_this.detail = detailView;
				}
			}
		} else {
			// 其他页面需要共享主页面的部分配置
			var main_http_opts = plus.storage.getItem('http_opts');
			if (main_http_opts && typeof main_http_opts != 'undefined') {
				main_http_opts =  _this.parse(main_http_opts);
				// 只有当其他页面没有显式配置时,才复用主页面的配置
				if (!init.http || typeof init.http == 'undefined') {
					init.http = main_http_opts;
				}
			}
			var main_login_opts = plus.storage.getItem('login_opts');
			if (main_login_opts && typeof main_login_opts != 'undefined') {
				main_login_opts =  _this.parse(main_login_opts);
				// 只有当其他页面没有显式配置时,才复用主页面的配置
				if (!init.login || typeof init.login == 'undefined') {
					init.login = main_login_opts;
				}
			}
		}
		
		// 设置头部状态栏样式
		var statusBar = init.statusBar || {};
		_this.setStatusBarStyle(statusBar.background, statusBar.highlight);
		
		// 设置当前窗口样式
		if (init.style) {
			_this.currentView.setStyle(init.style);
		}
		
		// 继承默认配置
		_this.opts = mui.extend(default_opts, options, true);
		
		// 处理视图
		if (init.views && typeof init.views != 'undefined') {
			var views = init.views;
			// 预加载一些页面
			var preload = views.preload;
			if (preload && typeof preload != 'undefined' && preload.length > 0) {
				_this.preloads = [];
				_this.each(preload, function(i, v){
					var id = v.id;
					if (!id || typeof id == 'undefined') {
						throw 'preload.id required';
					}
					var url = v.url || "";
					var styles = v.styles || {};
					if (typeof styles == 'function') {
						styles = styles(_this);
					}
					var extras = v.extras || {};
					extras.preload = true;
					view = _this.createWebview(url, id, styles, extras);
					if (extras.doubleBuffer == true) {
						var v2 = _this.createWebview('', id+"_dblid_", styles, extras);
						_this.preloads.push(v2);
					}
					_this.preloads.push(view);
				});
				
				// 绑定父窗口
				_this.each(preload, function(i, v){
					if (v.parent) {
						var view = plus.webview.getWebviewById(v.id);
						var pView = plus.webview.getWebviewById(v.parent);
						pView.append(view);
						if (v.extras && v.extras.doubleBuffer == true) {
							var v_dbl = plus.webview.getWebviewById(v.id+"_dblid_");
							_this.each(preload, function(i, v2){
								if (v.parent == v2.id) {
									var id = v2.id;
									if (!id || typeof id == 'undefined') {
										throw 'preload.id required';
									}
									var url = v2.url || "";
									var styles = v2.styles || {};
									if (typeof styles == 'function') {
										styles = styles(_this);
									}
									var extras = v2.extras || {};
									extras.preload = true;
									var p_dbl = _this.createWebview(url, id+"_dblid_", styles, extras);
									p_dbl.append(v_dbl);
								}
							});
							
						}
					}
				});
			}
			// 创建子窗口
			var children = views.children;
			if (children && typeof children != 'undefined' && children.length > 0) {
				_this.children = [];
				_this.each(children, function(i, v){
					var id = v.id;
					if (!id || typeof id == 'undefined') {
						throw 'children.id required';
					}
					var url = v.url || "";
					var styles = v.styles || {};
					if (typeof styles == 'function') {
						styles = styles(_this);
					}
					var extras = v.extras || {};
					extras.preload = true;
					view = _this.createWebview(url, id, styles, extras);
					plus.webview.currentWebview().append(view);
					_this.children.push(view);
				});
			}
		}
		
		return init;
	}

	this.openTab = function(tabid, callback) {
		callback = callback || function(){};
		var viewid = tabid;
		if (_this.openedTab == viewid) {
			return;
		}
		
		var main = _this.opts.init.views.main;
		_this.each(main.tabs, function(i,v){
			v.id = v.id || v.url;
			if (v.id == viewid) {
				var tabview = plus.webview.getWebviewById(viewid);
				if (typeof tabview == 'undefined' ||  !tabview) {
					tabview = _this.createWebview(v.url,v.id,main.styles,{url:v.url});
					plus.webview.currentWebview().append(tabview);
					_this.main.tabs.push(tabview);
				}
				
				tabview.addEventListener('show', function(e){
					tabview.removeEventListener('show');
					callback(e);
				});
				
				var url = v.url;
				var currUrl = tabview.getURL();
				if (!currUrl || currUrl.indexOf(url) == -1) {
					tabview.loadURL(url);
					tabview.addEventListener('loaded', function(e){
						tabview.removeEventListener('loaded');
						mui.fire(tabview, 'beforeShow');
						tabview.show();
					});
				} else {
					mui.fire(tabview, 'beforeShow');
					tabview.show();
				}
				_this.openedTab = viewid;
			} else {
				var tabview2 = plus.webview.getWebviewById(v.id);
				if (tabview2) {
					tabview2.hide();
				}
			}
		});
//		_this.each(_this.main.tabs, function(i,v){
//			if (v.id == viewid) {
//				var url = v.url;
//				var currUrl = v.getURL();
//				if (!currUrl || currUrl.indexOf(url) == -1) {
//					v.loadURL(url);
//				} 
//				_this.openedTab = viewid;
//				v.show();
//			} else {
//				v.hide();
//			}
//		});
	}
	
//	this.showMenu = function(e) {
//		e = e || {};
//		var currview = plus.webview.currentWebview();
//		if (e.opener) {
//			currview = e.opener;
//		}
//		var zidx = currview.getStyle().zindex || 0;
//		var zindex = zidx+1;
//		var opener = currview.id;
//		var menuview = _this.menu();
//		if (e.menuview) {
//			menuview = e.menuview;
//		}
//		menuview.setStyle({showed:true, zindex:zindex, opener: { id: opener, notifyTo: '' }});
//		currview.setStyle({mask: 'rgba(0,0,0,0.5)'});
//		menuview.show('slide-in-bottom', 100);
//		menuview.showed = true;
//		// 点击遮罩层，隐藏菜单
//		currview.addEventListener("maskClick", function(e){
//			_this.hideMenu({
//				opener : currview,
//				menuview : menuview
//			});
//		});
//	}
	
//	this.hideMenu = function(e) {
//		e = e || {};
//		var menuview = _this.menu();
//		if (e.menuview) {
//			menuview = e.menuview;
//		}
//		
//		menuview.hide('auto', 100);
//		menuview.showed = false;
//		if (e.opener) {
//			e.opener.setStyle({mask: 'none'});
//			// 移除掉遮罩层点击事件
//			e.opener.removeEventListener("maskClick");
//		} else {
//			plus.webview.currentWebview().setStyle({mask: 'none'});
//			// 移除掉遮罩层点击事件
//			plus.webview.currentWebview().removeEventListener("maskClick");
//		}
//	}
//	
//	this.toggleMenu = function(e) {
//		e = e || {};
//		var menuview = _this.menu();
//		if (e.menuview) {
//			menuview = e.menuview;
//		}
//		var showed = menuview.getStyle().showed;
//		if (menuview.showed == true || showed == true) {
//			_this.hideMenu(e);
//		} else {
//			_this.showMenu(e);
//		}
//	}
	
	this.openContent = function(url, opts) {
		opts = opts || {};
		opts.id = "content-view";
		_this.openWindow(url, opts);
	}

	this.openList = function(url, opts) {
		opts = opts || {};
		opts.id = "list-view";
		_this.openWindow(url, opts);
	}

	this.openDetail = function(url, opts) {
		opts = opts || {};
		opts.id = "detail-view";
		_this.openWindow(url, opts);
	}

	this.handleDeviceReady = function(options) {
		var deviceReady = options.deviceReady;
		if (typeof deviceReady == 'function') {
			var device = plus.device;
			device.info = {
				型号 : device.model,
				生产厂商 : device.vendor,
				唯一标识 : device.uuid,
				国际移动设备身份码 : device.imei,
				国际移动用户识别码 : device.imsi,
				操作系统语言 : plus.os.language,
				操作系统版本 : plus.os.version,
				操作系统名 : plus.os.name,
				操作系统供应商 : plus.os.vendor,
				网络类型 : NET_TYPES[plus.networkinfo.getCurrentType()],
			}
			_this.device = device;
			deviceReady(device);
		}
	}
	
	this.handleEvents = function() {
		var events = _this.opts.events;
		if (events && typeof events == 'object') {
			_this.events = {};
			var device = events.device;
			if (device && typeof device == 'object') {
				_this.events.device = {};
				if (device.pause && typeof device.pause == 'function') {
					_this.events.device.pause = function(e) {
						e = e || {};
						device.pause(e);
					};
					document.addEventListener('pause', _this.events.device.pause, false);
				}
				if (device.resume && typeof device.resume == 'function') {
					_this.events.device.resume = function(e) {
						e = e || {};
						device.resume(e);
					}; 
					document.addEventListener('resume', _this.events.device.resume, false);
				}
				if (device.newintent && typeof device.newintent == 'function') {
					_this.events.device.newintent = function(e) {
						e = e || {};
						device.newintent(e);
					};
					document.addEventListener('newintent', _this.events.device.newintent, false);
				}
			}
			// 处理消息推送事件的绑定
			var push = events.push;
			if (push && typeof push == 'object') {
				_this.events.push = {};
				if (push.click && typeof push.click == 'function') {
					_this.events.push.click = function(msg){
						push.click(msg);
					};
					// 监听消息栏点击事件
					plus.push.addEventListener('click', _this.events.push.click, false);
				}
				if (push.receive && typeof push.receive == 'function') {
					_this.events.push.receive = function(msg){
						push.receive(msg);
					};
					// 监听在线消息事件
					plus.push.addEventListener( "receive", _this.events.push.receive, false );
				}
			}
			
			// 处理设备按键事件的绑定
			var keys = events.keys;
			if (keys && typeof keys == 'object') {
				_this.events.keys = {};
				var hasKeyup = false;
				if (keys.back && typeof keys.back == 'function') {
					_this.events.keys.back = function(e){
						e = e || {};
						e.app = _this;
						keys.back(e);
					};
					window.addEventListener('onBackKeyup', _this.events.keys.back);
					hasKeyup = true;
				}
				if (keys.menu && typeof keys.menu == 'function') {
					_this.events.keys.menu = function(e){
						e = e || {};
						e.app = _this;
						keys.menu(e);
					};
					window.addEventListener('onMenuKeyup', _this.events.keys.menu);
					hasKeyup = true;
				}
				
				if (hasKeyup == true) {
					plus.key.addEventListener('keyup', function(e) {
						e = e || {};
						e.app = _this;
						// 返回键
						if (4 == e.keyCode) {
							mui.fire(plus.webview.currentWebview(), 'onBackKeyup');
							return;
						}
						// 菜单键
						if (82 == e.keyCode) {
							mui.fire(plus.webview.currentWebview(), 'onMenuKeyup');
							return;
						}
					});
				}
			}
			// 处理手势事件 gesture
			var gesture = events.gesture;
			if (gesture && typeof gesture == 'object') {
				_this.events.gesture = {};
				if (gesture.swiperight && typeof gesture.swiperight == 'function') {
					_this.events.gesture.swiperight = function(e){
						e = e || {};
						e.app = _this;
						// 判断角度
//						mui.toast(e.detail.angle);
						if (Math.abs(e.detail.angle) < 8) {
							gesture.swiperight(e);
						}
					};
					window.addEventListener('swiperight', _this.events.gesture.swiperight);
				}
				if (gesture.swipeleft && typeof gesture.swipeleft == 'function') {
					_this.events.gesture.swipeleft = function(e){
						e = e || {};
						e.app = _this;
						// 判断角度
//						mui.toast(e.detail.angle);
						if (Math.abs(e.detail.angle) > 172) {
							gesture.swipeleft(e);
						}
					};
					window.addEventListener('swipeleft', _this.events.gesture.swipeleft);
				}
			}
			
			// 处理view事件 
			var view = events.view;
			if (view && typeof view == 'object') {
				_this.events.view = {};
				if (view.loaded && typeof view.loaded == 'function') {
					_this.events.view.loaded = function(e){
						e = e || {};
						e.app = _this;
						view.loaded(e);
					};
					window.addEventListener('loaded', _this.events.view.loaded);
				}
				if (view.loading && typeof view.loading == 'function') {
					_this.events.view.loading = function(e){
						e = e || {};
						e.app = _this;
						view.loading(e);
					};
					window.addEventListener('loading', _this.events.view.loading);
				}
				if (view.customShow && typeof view.customShow == 'function') {
					_this.events.view.customShow = function(e){
						e = e || {};
						e.app = _this;
						view.customShow(e);
					};
					window.addEventListener('customShow', _this.events.view.customShow);
				}
//				if (view.beforeHide && typeof view.beforeHide == 'function') {
//					_this.events.view.beforeHide = function(e){
//						e = e || {};
//						e.app = _this;
//						view.beforeHide(e);
//					};
//					window.addEventListener('beforeHide', _this.events.view.beforeHide);
//				}
				if (view.beforeShow && typeof view.beforeShow == 'function') {
					_this.events.view.beforeShow = function(e){
						e = e || {};
						e.app = _this;
						view.beforeShow(e);
					};
					window.addEventListener('beforeShow', _this.events.view.beforeShow);
				}
				if (view.show && typeof view.show == 'function') {
					_this.events.view.show = function(e){
						e = e || {};
						e.app = _this;
						view.show(e);
					};
					window.addEventListener('show', _this.events.view.show);
				}
				if (view.hide && typeof view.hide == 'function') {
					_this.events.view.hide = function(e){
						e = e || {};
						e.app = _this;
						view.hide(e);
					};
					window.addEventListener('hide', _this.events.view.hide);
				}
			}
			//return;
			// 处理自定义事件的绑定
			var custom = events.custom;
			if (custom && typeof custom == 'object') {
				_this.events.custom = {};
				// FIXME 试验了好多遍,发现只能用一个数组来中转一下事件定义,否则会出一些奇怪的问题
				var eventList = [];
				for (var k in custom) {
					var handler = custom[k];
					var eid = new String(k);
					eventList.push({
						id : eid,
						handler : handler
					});
				}
				_this.each(eventList, function(i, v){
					var evid = v.id;
					var handler = v.handler;
					if (!handler || typeof handler != 'function') {
						return;
					}
					_this.events.custom[evid] = function(e){
						e = e || {};
						e.app = _this;
						handler(e);
					};
					window.addEventListener(evid, _this.events.custom[evid]);
				});
				
				var eachParentNode = function(el, callback) {
					if (!el || el.nodeName == '#document') {
						return null;
					}
					var stop = callback(el);
					if (stop) {
						return el;
					}
					eachParentNode(el.parentNode, callback);
				}
				// 绑定页面的app-event元素的tap事件
				var tapHandler = function(e) {
					var target = e.target;
//					mui.toast("tap->"+target.innerHTML);
					// 若本身或其父节点包含了这个attribute
					var eid = null;
					target = eachParentNode(target, function(el){
						try {
							eid = el.getAttribute('app-event');
							if (eid && typeof eid != 'undefined' && eid != '') {
								var handler = custom[eid];
								if (handler && typeof handler == 'function') {
									handler({
										target : el,
										app : _this,
										eventType : 'tap'
									});
								}
								return true;
							}
						} catch(e) {
							console.log(e.stack);
							//alert(e.stack);
						}
					});
				};
				document.addEventListener('tap', tapHandler);
			}
		}
	}
//	
	this.handleInterceptor = function(_continue) {
		// 若当前页面是主页面,则需要将拦截器配置保存起来,以让其他页面共享执行
		var interceptor = _this.opts.interceptor;
		if (_this.opts.init.isMainView) {
			if (interceptor && typeof interceptor == 'object') {
				plus.storage.setItem('interceptor_opts', _this.stringify(interceptor));
			}
		} else {
			interceptor = _this.parse(plus.storage.getItem('interceptor_opts'));
		}
		
		if (interceptor && typeof interceptor == 'object') {
			var before = interceptor.before;
			if (before && typeof before == 'function') {
				_this.pause = true;
				_this.continue = _continue;
				before(_this); 
				return;
			}
		}
		
		_continue();
	}
	
	this.handleTemplate = function(opts) {
		var opts = opts || {};
		
		var template = _this.opts.template;
		if (!template || typeof template != 'object') {
			_this.handleAppReady();
			plus.webview.currentWebview().setBlockNetworkImage(false);
			return;
		}
		// 找出所有合法的模板
		var templates = [];
		_this.each(document.scripts, function(i,v) {
			var type = null;
			try {
				type = v.getAttribute("type");
			} catch (e) {
				return;
			}
			if ("text/template" != type) {
				return;
			}
			templates.push(v);
		});
		if (templates.length == 0) {
			_this.handleAppReady();
			plus.webview.currentWebview().setBlockNetworkImage(false);
			return;
		}
		plus.webview.currentWebview().setBlockNetworkImage(true);
		var templateNotDoneCounter = templates.length-1;
		_this.each(templates, function(i,v) {
			var type = v.getAttribute("type");
			// 定义Template
			var tpl = { 
				id : v.getAttribute("id"),
				ajax : {
					url : v.getAttribute("url"),
					options : { loading: '', data : {} },
					result : null,
					stop : false,
					reload : opts.reload || false,
				},
				html : v.innerHTML,
				output : null,
				model : null,
				pullRefresh : {
					up : false,
					down : true
				}
			}
			// 覆盖参数
			if (opts.beforeDefined && typeof opts.beforeDefined == 'function') {
				opts.beforeDefined(tpl);
			}
			
			if (typeof template.defined == 'function') {
				// 触发define事件
				var _tpl = _this.opts.template.defined(tpl);
				template = _tpl || template;
			}
			
			// 覆盖参数
			if (opts.beforeAjax && typeof opts.beforeAjax == 'function') {
				opts.beforeAjax(tpl);
			}else if(template.beforeAjax && typeof template.beforeAjax === 'function'){
				template.beforeAjax(tpl);
			}
			
			if (tpl.ajax.reload == true) {
				tpl.ajax.options.cache = false;
			}
			
			if (tpl.ajax.stop && tpl.ajax.stop == true) {
				templateNotDoneCounter--;
				if (templateNotDoneCounter <= 0) {
					// 触发app ready events
					_this.handleAppReady();
					if (typeof template.complete == 'function') {
						// 触发complete事件
						setTimeout(function(){
							plus.webview.currentWebview().setBlockNetworkImage(false);
							template.complete(tpl);
						},1000);
					}
				}
				return;
			}
			if (!tpl.ajax.url || typeof tpl.ajax.url == 'undefined' || tpl.ajax.url == '') {
				if (typeof template.render == 'function') {
					// 触发render事件
					var output = template.render(tpl);
					tpl.output = output || tpl.output;
				} else {
					tpl.output = tpl.html;
				}
				if (opts.append && typeof opts.append != 'undefined' && opts.append == true) {
					document.getElementById(tpl.id).insertAdjacentHTML('beforeend', tpl.output);
				} else {
					document.getElementById(tpl.id).innerHTML = tpl.output;
				}
				templateNotDoneCounter--;
				if (templateNotDoneCounter <= 0) {
					// 触发app ready events
					_this.handleAppReady();
					if (typeof template.complete == 'function') {
						// 触发complete事件
						setTimeout(function(){
							plus.webview.currentWebview().setBlockNetworkImage(false);
							template.complete(tpl);
						},1000);
					}
				}
				return ;
			}
//			console.log(tpl.ajax.url+"-"+_this.stringify(tpl.ajax.options));
			// 发起ajax请求
			_this.httpClient().ajax('GET', tpl.ajax.url, tpl.ajax.options, function(result) {
				tpl.ajax.result = result;
//				console.log("result------>\r\n\t"+JSON.stringify(result));
				if (opts.ajaxSuccess && typeof opts.ajaxSuccess == 'function') {
					opts.ajaxSuccess(tpl);
				}
				
				if (typeof template.render == 'function') {
					// 触发render事件
					var output = template.render(tpl);
					tpl.output = output || tpl.output;
				} else {
					tpl.output = JSON.stringify(result);
				}
				if (opts.append && typeof opts.append != 'undefined' && opts.append == true) {
					document.getElementById(tpl.id).insertAdjacentHTML('beforeend', tpl.output);
				} else {
					document.getElementById(tpl.id).innerHTML = tpl.output;
				}
				
				templateNotDoneCounter--;
				if (templateNotDoneCounter <= 0) {
					// 触发app ready events
					_this.handleAppReady();
					if (typeof template.complete == 'function') {
						// 触发complete事件
						setTimeout(function(){
							plus.webview.currentWebview().setBlockNetworkImage(false);
							template.complete(tpl);
						},1000);
					}
				}
			}, function(xhr, type, statusText){
				// 触发error事件
				tpl.e = { xhr:xhr,type:type,statusText:statusText };
				if (opts.ajaxError && typeof opts.ajaxError == 'function') {
					opts.ajaxError(tpl);
				}
				if (typeof template.error == 'function') {
					template.error(tpl);
				} else {
					console.log("发生错误, 状态码:"+xhr.status+",类型:"+type+", 描述:"+xhr.statusText);
				}
				templateNotDoneCounter--;
				if (templateNotDoneCounter <= 0) {
					// 触发app ready events
					_this.handleAppReady();
					if (typeof template.complete == 'function') {
						// 触发complete事件
						setTimeout(function(){
							plus.webview.currentWebview().setBlockNetworkImage(false);
							template.complete(tpl);
						},1000);
					}
				}
			});
		});
	}
	
	this.handleAppReady = function() {
		if (_this.appready == true) {
			return;
		}
		if (typeof _this.opts.appReady == 'function') {
			_this.opts.appReady(_this);
			_this.appready = true;
		}
	}
	
	this.notifyOpener = function(ev, data) {
		var opener = _this.opener();
		if (typeof ev == 'object') {
			data = ev;
			var opt = plus.webview.currentWebview().getStyle().opener;
			var notifyTo = opt.notifyTo;
			data.notifyTo = notifyTo;
			mui.fire(opener, 'onNotify', data);
		} else {
			mui.fire(opener, ev, data);
		}
	}
	
	this.opener = function() {
		var opt = plus.webview.currentWebview().getStyle().opener;
		var id = opt.id;
		var opener = plus.webview.getWebviewById(id);
		return opener;
	}
	
	this.parent = function() {
		return plus.webview.currentWebview().parent();
	}
	
	this.notifyParent = function(ev, data) {
		var parent = plus.webview.currentWebview().parent();
		mui.fire(parent, ev, data);
	}
	
	this.notifyChildren = function(ev, data) {
		data = data || {};
		_this.each(plus.webview.currentWebview().children(), function(i,v){
			mui.fire(v, ev, data);
		});
	}
	
	this.notifySiblings = function(ev, data) {
		_this.eachSiblings(function(i,v){
//			var styles = v.getStyle();
//			var notifications = styles.notifications || [];
//			notifications.push({event : ev, data : data});
//			v.setStyle({notifications:notifications});
//			alert("fire->"+v.id+","+v.getURL()+","+ev+","+JSON.stringify(data));
			mui.fire(v, ev, data);
		});
	}
	
	this.scrollTop = function(webview) {
		webview = webview || plus.webview.currentWebview();
		webview.evalJS('mui.scrollTo(0, 100)');
	}
	
	this.eachSiblings = function(handler) {
		var curr = plus.webview.currentWebview();
		var parent = curr.parent();
		_this.each(parent.children(), function(i,v){
			if (v.id == curr.id) {
				return;
			}
			handler(i, v);
		});
	}
	
	this.showWaiting = function(title, opts) {
		title = title || '';
		opts = opts || {padlock:true,background:'#ccc'};
		plus.nativeUI.showWaiting(title, opts);
	}
	
	this.createWebview = function(url, viewid, styles, extras,events) {
		styles = styles || {};
		events = events || {};
		var waiting = styles.waiting || false;
		var view = plus.webview.getWebviewById(viewid);
		if (view) {
			// 若已经存在容器, 则需要进一步判断是否需要重新load页面
			
			var load = styles.reload || false;
			try {
 				var currUrl = view.getURL();
 				if (!currUrl || currUrl == null || currUrl == 'null') {
 					load = true;
 				}
 				if (currUrl.indexOf(url) == -1) {
 					load = true;
 				}
			} catch (e) {
				load = true;
			}
			if (load == true) {
				if (waiting == true) {
					_this.showWaiting();
				}
				
				view.loadURL(url);
			}
			
			view.load = load;
			styles = styles || {};
			styles.load = load;
			view.setStyle(styles);
			return view;
		} 
		
		var create = function(_url, _viewid, _styles, _extras, _events) {
			_events = _events || {};
			if (waiting == true) {
				_this.showWaiting();
			}
			_styles = _styles || {};
			if (typeof _styles.blockNetworkImage == 'undefined') {
				_styles.blockNetworkImage = true;
			}
			_styles.load = true;
			_styles.popGesture = 'hide';
			var _view = plus.webview.create(_url, _viewid, _styles, _extras);
			_view.load = true;
			_view.addEventListener('loaded', function(e) {
				if (_events.onloaded) {
					_events.onloaded(e);	
				}
				mui.fire(_view, 'loaded');
			});
//			_view.addEventListener('loading', function(e) {
//				alert("fire loading");
//				mui.fire(_view, 'loading');
//			});
			_view.addEventListener("hide", function(e) {
//				alert("fire hide->"+_viewid+","+_url);
				if (_events.onhide) {
					_events.onhide(e);	
				}
				_view.setStyle({showed:false});
				mui.fire(_view, 'hide');
			});
			_view.addEventListener('close', function(e){
				if (_events.onclose) {
					_events.onclose(e);	
				}
			});
			_view.addEventListener("show", function(e) {
//				alert("fire show->"+_viewid+","+_url);
//				_view.setStyle({showed:true});
				mui.fire(_view, 'show');
			});
			return _view;
		}
		
//		var doubleBuffer = extras.doubleBuffer || false;
//		if (doubleBuffer == true) {
//			var tmpExtras = mui.extend(extras, {dblid:viewid}, true);
//			create('', viewid+"_dbl_", styles, tmpExtras);
//			
//			extras.dblid = viewid+"_dbl_";
//			alert("create dbl view " + JSON.stringify(tmpExtras));
//		}
		
		view = create(url, viewid, styles, extras, events);
//		alert("create view->"+viewid+", " + url); 
		return view;
	}
	
	this.open = function(url, opts) {
		return _this.openWindow(url, opts)
	}
	
	this.openWindow = function(url, opts) {
		opts = opts || {};
		var autoBack = true;
		if (typeof opts.autoBack != 'undefined' && opts.autoBack == false) {
			autoBack = false;
		}
		var title = opts.title || "";
		var reload = opts.reload || false;
		var styles = opts.styles || {};
		styles.reload = reload;
		styles.waiting = true;
		styles.autoBack = autoBack;
		var to = 120;
		var extras = opts.extras || {};
		var events = opts.events || {};
		var anishow = opts.anishow || {ani:'slide-in-right', speed:150}
		var onloaded = opts.onloaded || function(e){};
		var onclose = opts.onclose || function(e){};
		var notifyTo = 'onNotifyFrom_' + url.replace(/\./g, "_").replace(/\//g, "_");
 		if (opts.onNotify) {
 			_this[notifyTo] = opts.onNotify;
 		} else {
 			_this[notifyTo] = function(e){};
 		}
 		styles.opener = {
 			id : plus.webview.currentWebview().id,
 			notifyTo : notifyTo,
 		};
		var view = null;
		var viewid = opts.id || url+"_"+styles.opener.id;
		var layout = opts.layout;
		if (layout) {
			var layoutid = layout+"_"+styles.opener.id;
			var layoutView = App.createWebview(layout, layoutid);
			if (layoutView.load == true ) {
				layoutView.addEventListener('loaded', function(e){
					layoutView.removeEventListener('loaded');
					view = App.createWebview(url,viewid,styles,{},events);
					if (!view.parent()) {
						layoutView.append(view);
					}
					
					if (view.load == true) {
						view.addEventListener('loaded', function(e){
							view.removeEventListener('loaded');
							plus.nativeUI.closeWaiting();
							mui.fire(layoutView, 'beforeShow', opts);
							mui.fire(view, 'beforeShow', opts);
//							setTimeout(function(){
								onloaded(view);
								// 显示
								layoutView.show(anishow.ani, anishow.speed);
//							}, to);
						});
					} else { 
						plus.nativeUI.closeWaiting();
						mui.fire(layoutView, 'beforeShow', opts);
						mui.fire(view, 'beforeShow', opts);
						onloaded(view);
						// 显示
						layoutView.show(anishow.ani, anishow.speed);
					}
				});
			} else {
				view = App.createWebview(url,viewid,styles,{},events);
				if (!view.parent()) {
					layoutView.append(view);
				}
				
				if (view.load == true) {
					view.addEventListener('loaded', function(e){
						view.removeEventListener('loaded');
						plus.nativeUI.closeWaiting();
						mui.fire(layoutView, 'beforeShow', opts);
						mui.fire(view, 'beforeShow', opts);
//						setTimeout(function(){
							onloaded(view);
							// 显示
							layoutView.show(anishow.ani, anishow.speed);
//						}, to);
					});
				} else {
					plus.nativeUI.closeWaiting();
					mui.fire(layoutView, 'beforeShow', opts);
					mui.fire(view, 'beforeShow', opts);
					onloaded(view);
					// 显示
					layoutView.show(anishow.ani, anishow.speed);
				}
			}
			
		} else {
			view = App.createWebview(url,viewid,styles,{},events);
			if (view.parent()) {
				var layoutView = view.parent(); 
				if (layoutView.load == true ) {
					layoutView.addEventListener('loaded', function(e){
						layoutView.removeEventListener('loaded');
						if (view.load == true) {
							view.addEventListener('loaded', function(e){
								view.removeEventListener('loaded');
								plus.nativeUI.closeWaiting();
								mui.fire(layoutView, 'beforeShow', opts);
								mui.fire(view, 'beforeShow', opts);
//								setTimeout(function(){
									onloaded(view);
									// 显示
									layoutView.show(anishow.ani, anishow.speed);
//								}, to);
							});
						} else {
							plus.nativeUI.closeWaiting();
							mui.fire(layoutView, 'beforeShow', opts);
							mui.fire(view, 'beforeShow', opts);
							onloaded(view);
							// 显示
							layoutView.show(anishow.ani, anishow.speed);
						}
					});
				} else {
					if (view.load == true) {
						view.addEventListener('loaded', function(e){
							view.removeEventListener('loaded');
							plus.nativeUI.closeWaiting();
							mui.fire(layoutView, 'beforeShow', opts);
							mui.fire(view, 'beforeShow', opts);
//							setTimeout(function(){
								onloaded(view);
								// 显示
								layoutView.show(anishow.ani, anishow.speed);
//							}, to);
						});
					} else {
						plus.nativeUI.closeWaiting();
						mui.fire(layoutView, 'beforeShow', opts);
						mui.fire(view, 'beforeShow', opts);
						onloaded(view);
						// 显示
						layoutView.show(anishow.ani, anishow.speed);
					}
				}
			} else {
				if (view.load == true) {
					view.addEventListener('loaded', function(e){
						view.removeEventListener('loaded');
						plus.nativeUI.closeWaiting();
						mui.fire(view, 'beforeShow', opts);
//						setTimeout(function(){
							onloaded(view);
							// 显示
							view.show(anishow.ani, anishow.speed);
//						}, to);
					});
				} else {
					plus.nativeUI.closeWaiting();
					mui.fire(view, 'beforeShow', opts);
					onloaded(view);
					// 显示
					view.show(anishow.ani, anishow.speed);
				}
			}
		}
		
		return view;
	}

	this.openURL = function(url){
		var appidkey = plus.storage.getItem('appidkey');
		if (appidkey) {
			var appid = plus.storage.getItem(appidkey);
			if (appid) {
				if (url.indexOf('?') != -1) {
					url = url+"&"
				} else {
					url = url+"?"
				}
				url = url + appidkey + "="+ appid;					
			}
		}
		plus.runtime.openURL(url);
	}
	
	this.actionSheet = function(opts, callback) {
		opts = opts || {};
		var v = parseInt(plus.os.version.substring(0,1));
		if (_this.isIOS() == true && v == 7){
			var url = opts.url;
			if (typeof url == 'undefined' || !url || url == '') {
				console.log("can not open action sheet page cause the url is null");
				throw "url required";
			}
			var autoClose = true;
			if (typeof opts.autoClose != 'undefined' && opts.autoClose == false) {
				autoClose = false;
			}
			
			var styles = opts.styles || {
				bottom : '0px',
				height : '190px',
			};
			
			var parent = _this.parent();
			if (typeof parent == 'undefined' || !parent) {
				parent = plus.webview.currentWebview();
			}
			_this.showWaiting();
			
			var close;
			var notifyTo = 'onNotifyFrom_' + url.replace(/\./g, "_").replace(/\//g, "_");
	 		if (opts.onNotify) {
	 			_this[notifyTo] = function(e){
	 				opts.onNotify(e);
	 				if (autoClose == true) {
	 					close();
	 				}
	 			};
	 		} else {
	 			_this[notifyTo] = function(e){
	 				if (autoClose == true) {
	 					close();
	 				}
	 			};
	 		}
	 		styles.opener = {
	 			id : plus.webview.currentWebview().id,
	 			notifyTo : notifyTo,
	 		};
			var _view = _this.createWebview(url, url, styles);
			close = function() {
				_view.close('auto');
				setTimeout(function(){
					parent.setStyle({mask: 'none'});
				},100);
			};
			
			parent.addEventListener("maskClick", close);
			_view.addEventListener('loaded', function(){
				plus.nativeUI.closeWaiting();
				parent.setStyle({
					mask: 'rgba(0,0,0,0.5)'
				});
				_view.show('slide-in-bottom', 150);
			});
			
			return {
				webview: _view,
				close : close
			};
		} else {
			var _opts = {
				cancel : opts.cancel || "取消",
				buttons : opts.buttons || []
			};
			if (opts.title) {
				_opts.title = opts.title;
			}
			plus.nativeUI.actionSheet( 
				_opts,
				function(e){
					var idx = e.index;
					if (opts.onNotify){
						opts.onNotify({index:idx, detail:{index:idx}});
					}
				}
			);
		}
		
	}

	this.download = function(downUrl, opts) {
		opts = opts || {};
		var appidkey = plus.storage.getItem('appidkey');
		if (appidkey) {
			var appid = plus.storage.getItem(appidkey);
			if (appid) {
				if (downUrl.indexOf('?') != -1) {
					downUrl = downUrl+"&"
				} else {
					downUrl = downUrl+"?"
				}
				downUrl = downUrl + appidkey + "="+ appid;					
			}
		}
		var complete = opts.complete || function(d,s){};
		var statechanged = opts.statechanged || function(d,s){};
		var saveTo = opts.saveTo || "_doc/download/";
		var timeout = opts.timeout || "300";
		var fileName = opts.fileName || downUrl.substring(downUrl.lastIndexOf("/")+1, downUrl.indexOf("?"));
		var dtask = plus.downloader.createDownload(downUrl, {
			filename : saveTo + fileName,
			timeout : timeout			// 下载超时设置5分钟
		}, function ( download, status ) {
			// 下载完成			
			complete(download, status);
		});
		
		dtask.addEventListener( "statechanged", function(download, status){
			if(download.totalSize == 0 || download.downloadedSize==0)
				return;
			
			statechanged(download, status)
		}, false);

		dtask.start(); 
	}

	this.each = function(objs, callback) {
		if (!objs || typeof objs == 'undefined' || objs.length == 0) {
			return ;
		}
		
		for (var i = 0; i < objs.length; i++) {
			var obj = objs[i];
			if (!obj || typeof obj == 'undefined') {
				continue;
			}
			
			callback(i, obj);
		}
	}
	
	this.httpClient = function() {
		return new Http(_this.opts.init.http);
	}
	
	this.timeCost = function(start, end) {
		var cost = start - end//时间差的毫秒数
		//计算出相差天数
		var days = Math.floor(cost/(24*3600*1000));
		 
		//计算出小时数
		var leave1 = cost%(24*3600*1000);    //计算天数后剩余的毫秒数
		var hours = Math.floor(leave1/(3600*1000));
		//计算相差分钟数
		var leave2 = leave1%(3600*1000);        //计算小时数后剩余的毫秒数
		var minutes = Math.floor(leave2/(60*1000));
		//计算相差秒数
		var leave3 = leave2%(60*1000);      //计算分钟数后剩余的毫秒数
		var seconds = Math.round(leave3/1000);
		
		return {
			days : days,
			hours : hours,
			minutes : minutes,
			seconds : seconds
		};
	}
	
	this.stringify = function(jsonObj) {
		if (!jsonObj || typeof jsonObj != 'object') {
			return jsonObj;
		}
		var str = JSON.stringify(jsonObj, function(k,v){
			if (typeof v == 'function') {
				return v.toString();
			}
			return v;
		});	
		return str;
	}
	
	this.parse = function(str) {
		if (!str || typeof str != 'string') {
			return str;
		}
		var obj = JSON.parse(str, function (key, value) {
			if (value.toString().search("function")>-1) {
				var func = eval("eval("+value+")");
				return func;
			}
			return value;
		});
		
		return obj;
	}
	
	
	// 判断操作系统
	var ANDROID_OS_NAME = "android";
	var IOS_OS_NAME = "ios";
	var WINDOWS_PHONE_OS_NAME = "windowsphone";
	
	this.isAndroid = function() {
		return ANDROID_OS_NAME == _this.os;
	}
	this.isIOS = function() {
		return IOS_OS_NAME == _this.os;
	}
	this.isWP = function() {
		return WINDOWS_PHONE_OS_NAME == _this.os;
	}
	
	this.setStatusBarStyle = function(background, highlight) {
		if (!background || typeof background == 'undefined') {
			return ;
		}
		if (!_this.isIOS())
			return;
		var _style = null;
		if (highlight) {
			// 文字高亮显示，适合深色背景
			_style = "UIStatusBarStyleBlackOpaque";
		} else {
			// 默认黑色文字, 适合浅色背景
			_style = "UIStatusBarStyleDefault";
		}
		plus.navigator.setStatusBarBackground(background);
		plus.navigator.setStatusBarStyle(_style);
	}

	this.resetLoadMore = function() {
//		mui('#pullup-container').pullRefresh().refresh(true);
		if (App.pullup) {
			App.pullup.refresh(true);
		}
	}

	this.siblings = function(o){
		var a = [];//定义一个数组，用来存o的兄弟元素
		if (typeof o == 'undefined') {
			return a;
		}
		var p = o.previousSibling;
		while(p){//先取o的哥哥们 判断有没有上一个哥哥元素，如果有则往下执行  p表示previousSibling
			if(p.nodeType === 1){
				a.push(p);
			}
			p = p.previousSibling;//最后把上一个节点赋给p
		}
		a.reverse()//把顺序反转一下 这样元素的顺序就是按先后的了
		var n = o.nextSibling;//再取o的弟弟
		while(n) {//判断有没有下一个弟弟结点 n是nextSibling的意思
			if(n.nodeType === 1){
				a.push(n);
			}
			n = n.nextSibling;
		}
		
		return a;//最后按从老大到老小的顺序，把这一组元素返回
	}
	
	this.contains = function(array, element) {
		var contains = false;
		App.each(array,function(i,v){
			if (v == element) {
				contains = true;
				return;
			}
		});
		return contains;
	}

	return this;
})(mui);

function Http(options) {
	this.options = options || {};
	var _this = this;
	
    // 缓存开关
    var _cache = this.options.cache || false;
    this.useCache = _cache;
	// 超时参数
	var _timeout = this.options.timeout || 30000;
	mui.ajaxSettings.timeout = _timeout;
	// 发生错误时的回调函数
	var _error = this.options.error || function(xhr, type, statusText){
		console.log("发生错误, 状态码:"+xhr.status+",类型:"+type+", 描述:"+xhr.statusText);
	};
	mui.ajaxSettings.error = _error;
	// 请求完成(不管成功还是失败都会回调)的回调函数
	var _complete = this.options.complete || function(xhr, type, statusText){
		// 执行 after
		if (_this.options.after && typeof _this.options.after == 'function') {
			_this.options.after(xhr, type, statusText);
		}
	};
	mui.ajaxSettings.complete = _complete;
	
	if (Http.prototype.ajax == undefined) {
		/**
		 * 发起GET请求,获取JSON数据
		 * @param {Object} type HTTP请求类型 GET|POST|PUT|DELETE|...
		 * @param {Object} url 请求的URL地址
		 * @param {Object} options 
		 * 				options.data 请求参数, 
		 * 				options.timeout 超时时间
		 * 				options.cache 是否缓存
		 * 				options.loading 加载中提示文字,若没有则不显示加载中状态
		 * 				options.dataType script|json|xml|html|text
		 * @param {Object} success 成功的回调函数
		 * @param {Object} options 其他选项
		 */
		Http.prototype.ajax = function(type, url, options, success, error) {
			options = options || {};
			success = success || function(r){};
			var _useCache = false;
			if ('get' == type.toLowerCase()) {
				if (typeof options.cache == 'undefined') {
					_useCache = _this.useCache;
				} else {
					_useCache = options.cache;
				}
			}
			//缓存时间,默认60分钟
			var cacheTime = options.cacheTime || 60;
			error = error || _error;
			var data = options.data || options;
			var appidkey = plus.storage.getItem('appidkey');
			if (appidkey) {
				var appid = plus.storage.getItem(appidkey);
				if (appid) {
					data[appidkey] = appid;					
				}
			}
			
			var reqUrl = _this.options.base + url;
			var dataStr = [];
			// 为了保证cacheID一致性, 需要对参数名进行排序
			var pNames = new Array();
			for (var pName in data) {
				pNames.push(pName);
			}
//			console.log("before sort->"+pNames);
			pNames = pNames.sort();
//			console.log("after sort->"+pNames);
            for(var i = 0; i < pNames.length; i++) {
            	var pName = pNames[i];
//          	alert(pName);
            	var pValue = data[pName];
                if (pValue) {
                    dataStr.push(encodeURIComponent(pName) + "=" + encodeURIComponent(pValue));
                }
            }
            
            var hitCache = false; 
			var cacheID = reqUrl + "?" + dataStr.join("&");
			// handle cache
			if (_useCache) {
				var cacheData = plus.storage.getItem(cacheID);
//				console.log("get cache ->"+cacheID + ", " + cacheData);
				if (cacheData) {
					var _reload = false;
					try {
						var jsonObj = JSON.parse(cacheData);
						if (jsonObj._updateAt) {
							var start = jsonObj._updateAt;
							var startDate = new Date(start);
							var end = new Date().getTime();
							var cost = (end - start)/(1000*60);
							// 超过30分钟就强制刷新
//							console.log(startDate+","+new Date()+","+cost);
							if (cacheTime > 0 && cost > cacheTime) {
								_reload = true;
								plus.storage.removeItem(cacheID);
							}
						} else {
							plus.storage.removeItem(cacheID);
							jsonObj._updateAt = new Date().getTime();
							var jsondata = JSON.stringify(jsonObj);
							plus.storage.setItem(cacheID, jsondata);
						}
						if (_reload == false) {
							try {
								success(jsonObj);
								hitCache = true;
							} catch(e) {
								alert(e.stack);
							}
						}
					} catch (e2) {
						plus.storage.removeItem(cacheID);
					}
				}
			} else {
//				console.log("remove->"+cacheID);
				plus.storage.removeItem(cacheID);
				if ('get' == type.toLowerCase()) {
					_useCache = true;
				}
			}
			
			if (hitCache) {
				return ;
			}
			
			// 执行before
			if (_this.options.before && typeof _this.options.before == 'function') {
				var chain = {
					stop : false,
					preventDefault : function() {
						chain.stop = true;
					},
					type : type,
					url : url,
					options : options,
					success : success,
					error : error,
					view : plus.webview.currentWebview(),
				}
				_this.options.before(chain);
				if (chain.stop == true) {
					if (_this.options.after && typeof _this.options.after == 'function') {
						_this.options.after();
					}
					return ;
				}
			}
			
//			alert(reqUrl+"-"+JSON.stringify(data));
//			console.log("cache:"+_useCache+", "+reqUrl+"-"+JSON.stringify(data));
			mui.ajax(reqUrl, {
				data : data,
				dataType : options.dataType || 'json',
				type : type,
				timeout: options.timeout || _timeout,
				success : function(resp) {
					success(resp);
					var canCache = true;
					if (typeof options.canCache == 'function') {
						canCache = options.canCache(resp);
					} 
					
					if (canCache == true) {
						if (_useCache == true && resp) {
							resp["_updateAt"] = new Date().getTime();
							setTimeout(function(){
								var _jsonstr = JSON.stringify(resp);
								plus.storage.setItem(cacheID, _jsonstr);
							});
						}
					}
				},
				error : error,
			})
		};
	}
}


//做一些初始化的操作
mui.plusReady(function(){
	
	//初始日期控件
	mui('.mui-content').on('tap', '.wd-date', function(e) {
		var obj=this;
		plus.nativeUI.pickDate(function(e){
			var d = e.date;
			var y = d.getFullYear();
			var M = d.getMonth()+1;
			M = (M+"").length == 1 ? ("0"+M) : M;
			var d = d.getDate();
			d = (d+"").length == 1 ? ("0"+d) : d;
			var val = y+"-"+M+"-"+d;
			obj.value=val;
		});
		e.preventDefault();
	});
	
	// 初始语音输入的
	mui('.mui-content').on('tap', '.wd-icon-speech', function(e) {
		if(!window.plus)
			return;
		
		e.stopPropagation();
		e.preventDefault();
		
		var obj=e.target.parentNode;
		
		plus.speech.startRecognize({
			engine: 'iFly'
		}, function(s) {
			plus.speech.stopRecognize();
			
			var targetFor = obj.querySelector(".wd-speech");
			// xiongxing，语音返回会返回一些标点符号，这里需要去掉,s是个字符串数组
			var newS = [];
			for(var i=0;i<s.length;i++){
				
				newS.push(s[i].replace(/[,|，|。|！|!|.|、]/g,""))
			}
			
			targetFor.value=newS.join("");
		});
	});
	
});
