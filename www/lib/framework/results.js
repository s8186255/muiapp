/**
 * 统一的Results处理类
 */
var Results = (function() {
	var createResult = function () {
		var json = {
			status : -1,	// 1 表示成功 | 0 表示失败 | 2 需登陆 | 3 跳转页面
			err : "",		// 当 status=0 时的错误描述
			body : {},		// 当 status=1 时的业务数据包
			go : ""		// 当 status=3 时的跳转页面地址
		}
		
		return json;
	};
	var SUCCESS = 1;
	var FAIL = 0;
	var LOGIN = 2;
	var REDIRECT = 3;
	return {
		success : function(body) {
			var r = createResult();
			r.status = SUCCESS;
			r.body = body;
			return r;
		},
		fail : function(err) {
			var r = createResult();
			r.status = FAIL;
			r.err = err;
			return r;
		},
		login : function() {
			var r = createResult();
			r.status = LOGIN;
			return r;
		},
		isSuccess : function(r) {
			r = r || { status:-1 }
			return r.status == SUCCESS;
		},
		isFail : function(r) {
			r = r || { status:-1 }
			return r.status == Fail;
		},
		isNeedLogin : function(r) {
			r = r || { status:-1 }
			return r.status == LOGIN;
		},
		isRedirect : function(r) {
			r = r || { status:-1 }
			return r.status == REDIRECT;
		}
	}
})();