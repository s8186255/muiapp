/**
 * 动态更新资源，
 * 先检查是否有更新,如果有更新，把zip包下载到本地，
 * 然后把要更新的信息写入存储，并提示用户进行重启
 * 
 */
(function(){
	function getCheckUpdateUrl(){
		return "http://shan-gong.com/iask-update.json";
	}
	function getConfigWebAppVersion(){
		return 1;
	}
	/**
	 *	更新的日志写入错误文件，因为这个是容易出错的地方 
	 */
	var m_updateLog = {
		_logData : [],
		_date : null,
		_writer : null,
		_getTime : function(){
			var now = new Date();
			if(this._date == null){
				this._date = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
			}
			
			return this._date + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
		},
		init : function(){
			plus.io.requestFileSystem( plus.io.PRIVATE_DOC, function( fs ) {
				fs.root.getFile('update_log.txt',{create:true},function(fileEntry){
					fileEntry.createWriter(function(writer){
						m_updateLog._writer = writer;
						
						if(writer.length > 0){
							writer.seek(0);
							writer.truncate(writer.length);
						}

					});
				})
			});
		},
		log : function(msg){
			console.log(msg);
			if(m_updateLog._writer){
				//console.log(this._getTime() + ' ' + msg + '\r\n');
				try{
					m_updateLog._writer.write(this._getTime() + ' ' + msg + '\r\n');
				}catch(e){}
			}
		}
	}
	// 显示更新的界面
	var m_updateTip = {
		
		show : function(size){
			//this.callbackID = plus.bridge.callbackId(tip_success, tip_fail);
			plus.bridge.exec('FloatLabelPlugin','show',['Updating','16','','#000000',-200]);
		},
		updateProgress : function(downSize,totalSize){
			var dSizeKB = parseInt(downSize / 1024);
			var tSizeKB = parseInt(totalSize / 1024);
			if(dSizeKB > tSizeKB)
				dSizeKB = tSizeKB;
				
			var downStr =  dSizeKB + '/' + tSizeKB + ' KB';
			this.setText('Download：' + downStr);
		},
		setText : function(text){
			plus.bridge.exec('FloatLabelPlugin','setTextMy',[text]);
		},
		hide : function(){
			plus.bridge.exec('FloatLabelPlugin','hide',[]);
		}
	}
	/**
	 * 获取webapp的版本号，版本号写入文件，而不是存储
	 */
	function getWebAppVersion(callback,errBack){
		var defaultVersion = getConfigWebAppVersion();
		var v = plus.storage.getItem('update_version');
		console.log('[update] get update_version:' + v);
		if(v && parseInt(v)>defaultVersion){
			callback(v);
		}else{
			callback(defaultVersion);
		}
		/*
		plus.io.requestFileSystem( plus.io.PRIVATE_DOC, function( fs ) {
			// 可通过fs进行文件操作 
			fs.root.getFile('webapp_version.txt',{create:true},function(fileEntry){
				fileEntry.file( function(file){
					var fileReader = new plus.io.FileReader();
					
					fileReader.readAsText(file, 'utf-8');
					fileReader.onloadend = function(evt) {
						var v = evt.target.result; 
						if(v && v>defaultVersion){
							callback(v);
						}else{
							callback(defaultVersion);
						}
					}
				},function(){
					errBack();
				});
			},function(){
				errBack();
			})
		},function ( e ) {
			m_updateLog.log("getWebAppVersion failed: " + e.message );
		});
		*/
	};
	function writeWebAppVersion(v,callback,errBack){
		// 坑，妈蛋，setitem,不能直接保存数字，只能保存字符串，不能保存不进去，
		plus.storage.setItem('update_version',v+'');
		if(callback){
			callback();
		}
		/* iphone6 plus，下面的代码在write的时候老是crash，原因不明，改成Storage
		plus.io.requestFileSystem( plus.io.PRIVATE_DOC, function( fs ) {
			// 可通过fs进行文件操作 
			fs.root.getFile('webapp_version.txt',{create:true},function(fileEntry){
				fileEntry.createWriter(function(writer){
					writer.seek(0);
					writer.write(v);
					m_updateLog.log('[update] writeWebAppVersion succ:' + v);
					if(callback){
						callback();
					}
				},function(e){
					m_updateLog.log('[update] writeWebAppVersion failed:');
					if(errBack){
						errBack();
					}
				});
			})
		},function ( e ) {
			m_updateLog.log('[update] writeWebAppVersion failed:');
			if(errBack){
				errBack();
			}
		});
		*/
	}
	/**
	 * 下载文件 
	 * @param {Object} downUrl
	 */
	function downloadZip(downUrl,callback,errCallback){
		var fileName = new Date().getTime() + '.zip';
		var dtask = plus.downloader.createDownload(downUrl, {
			filename : "_doc/update/" + fileName,
			timeout : "300"			// 下载超时设置5分钟
		}, function ( d, status ) {
			// 下载完成			
			if ( status == 200 ) { 
				m_updateLog.log('[update] downloadZip succ:' +fileName);
				callback(fileName);		
			} else {
				m_updateLog.log('[update] downloadZip error:' + status);
				errCallback();
			}  
		});

		dtask.addEventListener( "statechanged", function(download, status){
			if(download.totalSize == 0 || download.downloadedSize==0)
				return;
			
			//console.log('downloading:'+download.downloadedSize + '/' + download.totalSize);
			//这里会触发 Maximum call stack size exceeded.的错误，原因不明。by xiongxing
			//m_updateTip.updateProgress(download.downloadedSize,download.totalSize);
		}, false);

		dtask.start(); 
	}
	/**
	 * 删除下载的资源包 
	 * @param {Object} fileName
	 */
	function deleteZip(fileName){
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function( fs ) {
			// 可通过fs进行文件操作 
			fs.root.getFile("update/" + fileName,{},function(fileEntry){
				fileEntry.remove();
				m_updateLog.log('[update] delete zip:' + fileName);
			},function(e){
				m_updateLog.log('[update] delete zip error:' + fileName);
			});
		});
	}
	var updater = {
		/**
		 * 检查更新，如果有更新，需要等更新完后才能调用回调函数显示页面
		 * @param {Object} callback
		 */
		checkUpdate : function(callback){
			var innerCallback = function(result,msg){
				if(msg){
					m_updateTip.setText(msg);
								
					window.setTimeout(function(){
						m_updateTip.hide();
						callback({
							hasUpdate : result	// 是否页面更新,
						});
					},800);
				}else{
					m_updateTip.hide();
					callback({
						hasUpdate : result
					});
				}
			}
			
			m_updateLog.init();
			// 检查更新
			getWebAppVersion(function(version){
				m_updateLog.log('[update] client web version:' +version);
				mui.ajax(getCheckUpdateUrl()+'?'+(new Date().getTime()), {
					dataType: 'json', //服务器返回json格式数据
					"type": "get", //HTTP请求类型g_moduleConfigs
					timeout: 4000, //超时时间设置为4秒；这里超时时间不能太常，宁愿直接失败
					success: function(jsonData) {
						
						// 这里可以做灰度升级
						if(jsonData["gray"] && jsonData["gray"].allow != "*"){
							var isGrayDevice = false,deviceName = "";
							
							if(mui.os.ios && jsonData["gray"].ios_device.length > 0){
								// ios 根据设备名称过滤
								var appInfo = plus.bridge.execSync("AppPlugin","getInfo",[]);
								if(appInfo)
									deviceName = appInfo.deviceName;
								
								for(var i=0;i<jsonData["gray"].ios_device.length;i++){
									if(deviceName == jsonData["gray"].ios_device[i]){
										isGrayDevice = true;
										break;
									}
								}
							}else if(mui.os.android && jsonData["gray"].android_device.length > 0){
								// 安卓根据imei进行过滤
								deviceName = plus.device.imei;
								for(var i=0;i<jsonData["gray"].android_device.length;i++){
									if(deviceName == jsonData["gray"].android_device[i]){
										isGrayDevice = true;
										break;
									}
								}
							}
							
							if(!isGrayDevice){
								console.log('[update] device not in gray');
								innerCallback(false);
								return;
							}else{
								console.log('[update] device ' + deviceName + ' in gray');
							}
						}
						
						var webData = jsonData.web;
						var isIos = mui.os.ios;
						var pkgData = null;
						if(jsonData.pkg)
							pkgData = isIos ? jsonData.pkg["ios"] : jsonData.pkg["android"];
							
						if(pkgData){
							// 先检查时候有最新的包更新
							var clientVersions = plus.runtime.version.split('.');
							var serverVersions = pkgData.versionName.split('.');
							var needUpdatePkg = false;
							
							for(var i=0;(i<clientVersions.length&&i<serverVersions.length);i++){
                                var cv =parseInt(clientVersions[i]),sv=parseInt(serverVersions[i]);
                                if(cv > sv){
                                    break;
                                }
								if(cv < sv){
									needUpdatePkg = true;
									break;
								}
							}
							m_updateLog.log('[update] pkg c-s version:'+ plus.runtime.version + '|' +pkgData.versionName +'|' +needUpdatePkg);
						}else{
							m_updateLog.log('[update] no pkg update info');
						}
						if(needUpdatePkg){
							innerCallback(false);
							// 需要更新，延迟3秒再弹出提示说有更新，因为confirm必须再closeSplash后才能弹出来。
							window.setTimeout(function(){
								plus.nativeUI.confirm("Found a new version:" +pkgData.versionName + ". Download now?", function(i){
									if ( 0==i.index ) {
										plus.runtime.openURL(pkgData.url);
									}
								}, "Update", ["Yes","No"]);
							},3000);
							
						}else{
							m_updateLog.log('[update] server web version:'+ webData.version);
							if(webData.version > version){
								var _update = function() {
									m_updateTip.show();
									downloadZip(webData.zip,function(filename){
										// 资源下载完成,解压缩资源
										var success = function(args) {
											// 写入版本号
											console.log('succee write:' + webData.version)
											writeWebAppVersion(webData.version,function(){
												// 更新完成
												innerCallback(true);
												// 删除下载的zip包
												deleteZip(filename);
											},function(){
												innerCallback(false,'写入版本号失败,取消更新');
											});
										};
										var fail = function(code) {
											innerCallback(false,'解压资源失败,取消更新');
										};
		
										var callbackID = plus.bridge.callbackId(success, fail);
										plus.bridge.exec('UpdatePlugin','unzip',[callbackID,filename,'']);
									},function(){
										// download error
										innerCallback(false,'下载资源失败,取消更新');
									});
								}
								var netType = plus.networkinfo.getCurrentType();
								if (3 != netType) {
									// 需要更新，延迟3秒再弹出提示说有更新，因为confirm必须再closeSplash后才能弹出来。
									window.setTimeout(function(){
										plus.nativeUI.confirm("Found a new version but your device Network is not WIFI. Update it now?", function(i){
											if ( 0==i.index ) {
												_update();
											}
										}, "Update", ["Yes","No"]);
									},3000);
								} else { 
									_update();
								}
							}else{
								innerCallback(false);	// 不需要更新
							}
						}
					},
					error: function(xhr, type, errorThrown) {
						m_updateLog.log('[update] check update error:' +errorThrown);
						
						innerCallback(false);
					}
				});
			},function(){
				innerCallback(false);
			});
		}
		// 获取版本号
		//getWebAppVersion : getWebAppVersion
	}
	
	
	window.g_updater = updater;
})();
