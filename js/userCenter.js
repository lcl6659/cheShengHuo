var docHeight = document.documentElement.clientHeight;
$(function(){
	
	$("#imeiList").height(docHeight-$("#headBox").height());
	
	initUserInfo();
	initImeiList();
});



//初始化用户信息
function initUserInfo(){
	myAjax.getUserInfo(function(json){
		$("#userName").text(json.data.userName);
		$("#userMobile").text(json.data.telephone);
	});
}


//初始化设备列表
function initImeiList(){
	myAjax.getEqptList(function(json){
		var imeiList = json.data.list;
		if(imeiList.length>0){
			imeiList.forEach(function(imei,index){
				if(imei.licenseNum && imei.carId){
					var $_oneImeiClone = $("#cloneBox").find(".one-imei").clone();
				
					$_oneImeiClone.find(".imei-index").text(index+1);
					$_oneImeiClone.find(".imei-number").text(imei.imei);
					$_oneImeiClone.find(".relate-time").text(imei.bindTimeStr);
					$_oneImeiClone.find(".type").text(imei.modelStr);
					$_oneImeiClone.find(".end-time").text(imei.closeTimeStr);
					$_oneImeiClone.find(".state").text(imei.currentStatus || "--");
					$_oneImeiClone.find(".licenseNum").text(imei.licenseNum);
					$_oneImeiClone.find(".power").text(imei.electricity || "--");
					
					$("#imeiList").append($_oneImeiClone);
				}
			});
		}else{
			$("#imeiList").addClass("no-data");
		}
	});
}
