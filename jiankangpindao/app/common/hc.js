/**
 * Health Channel Javascript Library v0.1.1
 *
 * Author: J.Soon
 *
 * Released under the MIT license
 */
var HC = (function() {

	var hc = {};

	/**
	 * 加载状态提示框
	 * @param {string} loadingTxt: 加载提示框的文本信息，默认为“加载中”
	 */
	hc.loadingShow = function(loadingTxt) {
		loadingTxt = loadingTxt || '加载中';
		// 创建自定义遮罩层
		var span = document.createElement('span'),
			txt = document.createTextNode(' ' + loadingTxt),
			wrapper = document.createElement('div'),
			sjLoading = document.createElement('div'),
			vh = window.innerHeight;
		span.setAttribute('class', 'mui-icon mui-icon-spinner-cycle mui-spin');
		sjLoading.setAttribute('id', 'sjLoading');
		wrapper.appendChild(span);
		wrapper.appendChild(txt);
		wrapper.style.marginTop = vh / 3 + 'px';
		sjLoading.appendChild(wrapper);
		document.body.appendChild(sjLoading);
		sjLoading.style.display = 'block';
	};

	hc.loadingHide = function(delay) {
		// 销毁自定义遮罩层
		var sjLoading = document.getElementById('sjLoading');
		setTimeout(function() {
			sjLoading.parentNode.removeChild(sjLoading);
		}, (delay || 600));
	};

	return hc;

})();

/**
 * 暴露 HC 内部 API 到全局命名空间 window.hc 下，之后销毁掉 HC
 * 这种写法的意思是若前一个条件为真，才会执行后面的赋值语句
 * 若前一个条件为假，则不会执行后边的赋值语句
 */
(window.hc === undefined) && (window.hc = HC) && (HC = undefined);