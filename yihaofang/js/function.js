//返回按键监听事件
function backbutton(){
	   plus.key.addEventListener("backbutton",function(){
	   	//window.history.go(-1);
	   //alert(localStorage['stat']);
		    if(localStorage['stat']==1){
		    	 if(confirm('您是要退出1号房APP吗？')==true){
		        		plus.runtime.quit();
		         }
		    }else{
		    	//alert('[按键时值]浏览记录深度:'+window.history.length+'\n页面层级:'+localStorage['stat']);
		    	window.history.go(-1);
		    }
	    },false);	
}

//menu按键监听事件
function menubutton(){
	plus.key.addEventListener("menubutton",function(){
		 alert('im menu');
		},false);	
}

function setFatherParam(){
	$(window.parent.document).find("#baofooter").removeClass('fhidden');
	//alert(window.history.length);
	//alert('浏览记录深度:'+window.history.length+'\n页面层级:'+localStorage['stat']);
	window.localStorage.setItem('stat','1');
}

function setSonParam(){
	$(window.parent.document).find("#baofooter").addClass('fhidden');
	window.localStorage.setItem('stat','2');
	//alert('浏览记录深度:'+window.history.length+'\n页面层级:'+localStorage['stat']);
}

//获取当前时间
function currentTimeString(){
	var d = new Date();
	return d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"."+d.getMilliseconds();
}

//判断用户数据连接情况
function userDataCondition(){
	var stat=plus.networkinfo.getCurrentType();
	var result='';
	if(stat==plus.networkinfo.CONNECTION_UNKNOW || stat==plus.networkinfo.CONNECTION_NONE){
			result='未检测到您的数据连接，请连接后重试';
	}else if(stat==plus.networkinfo.CONNECTION_CELL2G){
			result='您正在使用2G网络，速度较慢';
	}
	return result;
}

/*
 * 更新用户登陆情况
 * */

function updateToken(token,uname,logtime){
	/*
	var url_01=localStorage['server']."update.php?token="+token+'&uname='+uname+'&callback=?';
	$.getJSON(url_01,function(data){
		var t=eval(data);
		if(t[0]!='false'){
			//更新本地登陆信息
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('time');
						
			//更新令牌
			window.localStorage.setItem('token',t[0]);
			window.localStorage.setItem('time',t[1]);
		}else{
			//返回错误,删除所有登陆信息
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('time');
			window.localStorage.removeItem('uname');
		}
		
	});*/
}

//格式化输出货币
//@param n 输入的数值
//@param c 按多少位进行切割
//@param t 分隔符号
function allNum(n,c,t){
	if(!isNaN(n)){
		var str=n.toString();
		var len=str.length;
			if(n<=c){
				return n;	//如果小于指定位数，直接返回
			}else{
				var head=len%c;	//取余数作为头部位数
				var rst='';							
				if(head){			//去除正好整除的情况
					count=Math.floor(len/c);				//计算有几个分隔符
				}else{
					count=len/c-1;
					head=c;							
				}
							
				rst=str.substring(0,head);
									
				for(var i=0;i<count;i++){
					rst+=t+str.substring(head,head+c);	//截取支付串
					head+=c;	//加分隔符
				}
				return rst;							
			}
		
	}else{
		return 'not number';
	}
}

//格式化输出货币
//@param n 输入的数值
//@param c 按多少位进行切割
//@param t 分隔符号
function myNum(n,c,t){
	if(!isNaN(n)){
		var aa=n.toString();
		var len=aa.length;
		
		//如果超过10万，显示为万
		if(len>5){
			n=Math.round(n/10000);
			var str=n.toString();
			var len=str.length;
			if(n<=c){
				return n;	//如果小于指定位数，直接返回
			}else{
				var head=len%c;	//取余数作为头部位数
				var rst='';							
				if(head){			//去除正好整除的情况
					count=Math.floor(len/c);				//计算有几个分隔符
				}else{
					count=len/c-1;
					head=c;							
				}
							
				rst=str.substring(0,head);	//处理四舍五入
									
				for(var i=0;i<count;i++){
					rst+=t+str.substring(head,head+c);	//截取支付串
					head+=c;	//加分隔符
				}
				return rst+'万';							
			}
		}else{
			var str=n.toString();
			var len=str.length;
			if(n<=c){
				return n;	//如果小于指定位数，直接返回
			}else{
				var head=len%c;	//取余数作为头部位数
				var rst='';							
				if(head){			//去除正好整除的情况
					count=Math.floor(len/c);				//计算有几个分隔符
				}else{
					count=len/c-1;
					head=c;							
				}
							
				rst=str.substring(0,head);
									
				for(var i=0;i<count;i++){
					rst+=t+str.substring(head,head+c);	//截取支付串
					head+=c;	//加分隔符
				}
				return rst;							
			}
		}							
	}else{
		return 'not number';
	}
}

function fsubstr(str,n){
	  var r=/[^\x00-\xff]/g;
	  if(str.replace(r,"mm").length<=n){return str;}
	  var m=Math.floor(n/2);
	  for(var i=m;i<str.length;i++){
	      if(str.substr(0,i).replace(r,"mm").length>=n){
	          return str.substr(0,i)+"...";
	      }
	  }
	  return str;
}

 function getID(){
    var aa=window.location.href;
	var arrtmp=aa.split("?");
	var param=arrtmp[1].split("=");
	return param[1];
}
 
 function getParam(){
    var source=window.location.href;
	var arrtmp=source.split("?");
	var params=arrtmp[1].split("&");
	var id=params[0].split("=");
	var type=params[1].split("=");
	var rst=[];
	rst[0]=id[1];
	rst[1]=type[1];
	return rst;
}
//遍历object 或者 array	
function subObj(obj,txt){
	$.each(obj,function(key,val){
		if($.isPlainObject(val) || $.isArray(val)){
			subObj(val);
		}else{
			txt+= key+'='+val+';';
		}
	});
	return txt;
}