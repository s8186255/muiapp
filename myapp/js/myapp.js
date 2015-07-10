var first = null;
mui.back = function() {
	//首次按键，提示‘再按一次退出应用’
	if (!first) {
		first = new Date().getTime();
		mui.toast('suanqi再按一次退出应用了');
		setTimeout(function() {
			first = null;
		}, 1000);
	} else {
		if (new Date().getTime() - first < 1000) {
			plus.runtime.quit();
		}
	}
};