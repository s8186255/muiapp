var Search=(function() {
	
	
	return {
		showSearch:function(data) {
			//显示搜索条件
			var searchc=document.querySelector(".search-c");
			var refreshc=document.querySelector("#refreshContainer");
			
			var html=['搜索条件：'];
			for(var key in data){
				if(data[key]){
					html.push('<span class="search-txt">');
					html.push(data[key]+'<span app-event="clearSearch" key="'+key+'" class="mui-icon mui-icon-close"></span>');
					html.push('</span>');
				}
			}
			if(html.length==1){
				searchc.style.display="none";
				refreshc.style.paddingTop="0px";
				return;
			}else{
				searchc.style.display="block";
				refreshc.style.paddingTop="50px";
			}
			searchc.innerHTML=html.join("");
		}
	};
})();