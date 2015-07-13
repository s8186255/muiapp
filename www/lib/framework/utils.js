var Utils = (function() {
	var trim = function(str) {
		str = str || "";
		return str + "".replace(/(^\s*)|(\s*$)/g, "");
	};

    var _formatTime=function(time,fmt){
        if(time == null)
            return '-';
        var o = {
            "M+": time.getMonth() + 1, //月份
            "d+": time.getDate(), //日
            "h+": time.getHours(), //小时
            "m+": time.getMinutes(), //分
            "s+": time.getSeconds(), //秒
            "q+": Math.floor((time.getMonth() + 3) / 3), //季度
            "S": time.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };



	return {
		trim: trim,
		isEmpty: function(str) {
			return !str || str == null || (typeof str == 'undefined') || trim(str).length == 0;
		},
		appendImgSize: function(path, w, h) {
			var index = path.lastIndexOf(".");
			var preffix = path.substring(0, index);
			var suffix = path.replace(preffix, "");
			var newPath = preffix + "-" + w + "x" + h + suffix;
			return newPath;
		},
		date:function(num){
			var d= new Date(num);
			return _formatTime(d,'yyyy/MM/dd');
		},
		time:function(num){
			var d= new Date(num);
			return _formatTime(d,'yyyy/MM/dd hh:mm:ss');
		}
	};
})();