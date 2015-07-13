/**
 * 判断应用是否需要升级，如果需要则升级
 * 升级文件为 JSON 格式，如下：
{
	"android":{
    	"version": "Android新版本号，如：1.0",
    	"note": "Android新版本描述信息，多行使用\n分割",
    	"url": "apk文件下载地址，如：http://www.dcloud.io/helloh5p/HelloH5.apk"
    }
}
 */
(function() {

	var server = 'http://www.pgyer.com/apiv1/user/listMyPublished', // 获取升级描述文件服务器地址
		appUrl = 'http://www.pgyer.com/HealthChannel', // APP 下载地址
		localDir = 'update', // 本地保存升级描述目录
		localFile = 'update.json', // 本地保存升级描述文件名
		keyUpdate = 'updateCheck', // 取消升级键名
		checkInterval = 60480000, // 升级检查间隔，单位为 ms，7 天为 7*24*60*60*1000=60480000，如果每次启动需要检查设置值为 0
		dir = null; // 本地保存升级描述目录对象

	/**
	 * 准备升级操作
	 * 创建升级文件保存目录
	 */
	function initUpdate() {
		// 打开 doc 根目录
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
			// 安装完 APP，首先找到 doc 下的 update 目录，没有则创建
			fs.root.getDirectory(localDir, {
				create: true
			}, function(dirEntry) {
				dir = dirEntry;
				checkUpdate();
			}, function(e) {
				console.log('准备升级操作，打开update目录失败：' + e.message);
			});
		}, function(e) {
			console.log('准备升级操作，打开doc目录失败：' + e.message);
		});
	};

	/**
	 * 检测程序升级
	 */
	function checkUpdate() {
		// 判断升级检测是否过期
		var lastcheck = plus.storage.getItem(keyUpdate);
		//		console.log(lastcheck);
		if (lastcheck) {
			var dc = parseInt(lastcheck); // 最后一次检测时的日期
			var dn = (new Date()).getTime(); // 当前的日期
			if (dn - dc < checkInterval) { // 若未超过上次升级检测间隔，则不需要进行升级检查
				return;
			}
			// 取消已过期，删除取消标记
			plus.storage.removeItem(keyUpdate);
		}
		// 读取本地 update.json 升级文件，若不存在，则创建 update.json
		dir.getFile(localFile, {
			create: false
		}, function(fileEntry) {
			fileEntry.file(function(file) {
				var reader = new plus.io.FileReader();
				reader.onloadend = function(e) {
					fileEntry.remove();
					var data = null;
					//					console.log(e.target.result);
					try {
						data = JSON.parse(e.target.result);
					} catch (e) {
						console.log('读取本地升级文件，数据格式错误！');
						return;
					}
					checkUpdateData(data);
				}
				reader.readAsText(file);
			}, function(e) {
				console.log('读取本地升级文件，获取文件对象失败：' + e.message);
				fileEntry.remove();
			});
		}, function(e) {
			// 失败表示文件不存在，从服务器获取升级数据
			getUpdateData();
		});
	};

	/**
	 * 检查升级数据
	 */
	function checkUpdateData(data) {
		var curVer = plus.runtime.version, // 当前 app 的版本号
			inf = data[plus.os.name]; // 当前 app 的系统类型（Android/iOS）
		//		console.log('curVer: ' + curVer);
		if (inf) {
			var srvVer = inf.version, // 服务器上最新的 app 版本号
				needUpdate = compareVersion(curVer, srvVer); // 是否需要升级标识
			//			console.log('srvVer: ' + srvVer);
			//			console.log('needUpdate: ' + needUpdate);
			// 判断是否需要升级
			if (needUpdate) {
				// 提示用户是否升级
				plus.ui.confirm(inf.note, function(i) {
					if (0 === i) {
						plus.runtime.openURL(inf.url);
					} else {
						plus.storage.setItem(keyUpdate, (new Date()).getTime().toString());
					}
				}, inf.title, ["立即更新", "取　　消"]);
			}
		}
	};

	/**
	 * 比较版本大小，如果新版本 nv 大于旧版本 ov 则返回 true，否则返回 false
	 * @param {String} ov
	 * @param {String} nv
	 * @return {Boolean}
	 */
	function compareVersion(ov, nv) {
		// 版本号不为空判断
		if (!ov || !nv || ov === "" || nv === "") {
			return false;
		}
		var b = false,
			ova = ov.split(".", 4), // [1, 0]
			nva = nv.split(".", 4); // [1, 1]
		//		console.log(ova);
		//		console.log(nva);
		for (var i = 0; i < ova.length && i < nva.length; i++) {
			var so = ova[i],
				no = parseInt(so),
				sn = nva[i],
				nn = parseInt(sn);
			if (nn > no || sn.length > so.length) {
				return true;
			} else if (nn < no) {
				return false;
			}
		}
		if (nva.length > ova.length && 0 === nv.indexOf(ov)) {
			return true;
		}
	};

	/**
	 * 从服务器获取升级数据
	 */
	function getUpdateData() {
		var xhr = new plus.net.XMLHttpRequest();
		xhr.onreadystatechange = function() {
			switch (xhr.readyState) {
				case 4:
					if (xhr.status == 200) {
						var response = JSON.parse(xhr.responseText);
						var serverVersion = response.data.list[0].appVersion, // 应用在蒲公英的最新版本号
							updateNote = response.data.list[0].appUpdateDescription; // 版本更新描述
						// 保存到本地文件中
						dir.getFile(localFile, {
							create: true
						}, function(fileEntry) {
							fileEntry.createWriter(function(writer) {
								writer.onerror = function() {
									console.log('获取升级数据，保存文件失败！');
								};
								var sJSON = '{' +
									'"Android": {' +
									'"version": "' + serverVersion + '",' +
									'"note": "' + updateNote + '",' +
									'"url": "' + appUrl + '"' +
									'}' +
									'}';
								writer.write(sJSON);
							}, function(e) {
								console.log('获取升级数据，创建写文件对象失败：' + e.message);
							});
						}, function(e) {
							console.log('获取升级数据，打开保存文件失败：' + e.message);
						});
					} else {
						console.log('获取升级数据，联网请求失败：' + xhr.status);
					}
					break;
				default:
					break;
			}
		}
		xhr.open('POST', server, true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send('uKey=1eddf9224e00e9d1ad6f0bc20bc7a33a&_api_key=690d40c431d4a30d0fb40d1dd185f88f');
	};

	if (window.plus) {
		initUpdate();
	} else {
		document.addEventListener('plusready', initUpdate, false);
	}

})();