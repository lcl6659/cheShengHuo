var docHeight = document.documentElement.clientHeight;
var map;
var selectEquipmentHeight = $("#selectEquipment").height();
var dataList;
var pointArr = [];
var carMarkerArr = [];
$(function() {
	//初始化地图容器高度
	$("#mapContainer").height(docHeight - $("#actionBox").height());
	initBMap();
	initCarList();
	
	
	//选择设备
	$("#selectEquipment").on("click", ".one-eq", function() {
		if(!$(this).hasClass("select")) {
			$(this).addClass("select").siblings().removeClass("select");
		}
	});
	
	//选择设备 -取消
	$("#selectEquipment").on("click", ".cancle-btn", function() {
		selectEquipmentBox(false);
	});

	//选择设备 -确定
	$("#selectEquipment").on("click", ".ok-btn", function() {
		if($("#eqBox").find(".select").length>0){
			var $_imei = $("#eqBox").find(".select");
			var imei = $_imei.text();
			var carId = $_imei.attr("car-id");
			var licenseNum = $_imei.attr("license-num");
			var href = worf.origin+"/view/playBack.html?imei="+imei+"&carId="+carId+"&licenseNum="+licenseNum;
			worf.nav.go(href);
		}
	});
	
	//背景点击
	$("#modelBack").on("click", function() {
		selectEquipmentBox(false);
	});
	
	//选择车辆
	$("#carList").on("click",".one-car",function(){
		var licenseNum = $(this).text();
		var carId = $(this).attr("car-id");
		getEqptByCarid(carId,licenseNum);
	});
	
	
});


/*
 * 初始化地图
 */
function initBMap(){
	map = new BMap.Map("mapContainer"); // 创建地图实例  
	var point = new BMap.Point(116.404, 39.915); // 创建点坐标  
	map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
	
	map.enableScrollWheelZoom();//鼠标滚轮控制缩放
//	map.addControl(new BMap.GeolocationControl());//定位控件，针对移动端开发，默认位于地图左下方。
	map.addControl(new BMap.NavigationControl());//地图平移缩放控件
//	map.addControl(new BMap.MapTypeControl());//默认位于地图右上方
	
}


/*
 * 初始化列表
 */
function initCarList(){
	myAjax.getCars(function(json){
		if(json.data.length>0){
			$("#carList").empty();
			map.clearOverlays();
			dataList = json.data;
			dataList.forEach(function(car) {
				if(car.currentEqpt && car.currentEqpt.longitude && car.currentEqpt.latitude){
					var point = new BMap.Point(car.currentEqpt.longitude, car.currentEqpt.latitude);
					pointArr.push(point);
					var carMarker = addMarker(map, point, "../imgs/car.png", 50, 27, 0, 0, 0);
					carMarkerArr.push(carMarker);
				}
				
				$_oneCar = $('<span class="one-car"></span>');
				$_oneCar.text(car.licenseNum);
				$_oneCar.attr("car-id",car.carId);
				
				$("#carList").append($_oneCar);
			});
		
			map.setViewport(pointArr,{
				margins:[10,10,10,10]
			});
			
			//添加左下角 控件
			var backInitPosition = new BackInitPosition(map,pointArr);
			map.addControl(backInitPosition);
			
			//添加右上角 控件
			var changeMapType = new ChangeMapType(map);
			map.addControl(changeMapType);
			
			
			//点只有一个车的时候
			if($("#carList").find(".one-car").length==1){
				var licenseNum = $("#carList").find(".one-car").eq(0).text();
				var carId = $("#carList").find(".one-car").eq(0).attr("car-id");
				getEqptByCarid(carId,licenseNum);
			}
			
		}else{
			worf.nav.replace(worf.origin+"/view/relateEqpt.html");
		}
	});
}

/*
 * 根据汽车carid获取设备
 */
function getEqptByCarid(carid,licenseNum) {
	myAjax.getEqptsByCarId({carId:carid},function(json){
		var imeiList = json.data.list;
		if(imeiList.length == 0) {
			worf.prompt.tip("该车辆无关联设备");
		} else if(imeiList.length == 1) {
			var imei = imeiList[0].imei;
			var carId = imeiList[0].carId;
			var href = worf.origin+"/view/playBack.html?imei="+imei+"&carId="+carId+"&licenseNum="+licenseNum;
//			var href = "playBack.html?imei="+imei+"&carId="+carId+"&licenseNum="+licenseNum;
			worf.nav.go(href);		
		}else{
			$("#eqBox").empty();
			json.data.list.forEach(function(oneImei){
				var $_eq = $('<div class="one-eq"></div>');
				$_eq.text(oneImei.imei);
				$_eq.attr("license-num",licenseNum);
				$_eq.attr("car-id",carid);
				$("#eqBox").append($_eq);
			});
			selectEquipmentBox(true);
		}
	});
}

/*
 * 添加覆盖物
 * map：地图对象
 * point：防置的点
 * imgPath：图片本地路径（相对路径）
 * imgWidth，imgHeight覆盖物宽、高
 * left：左偏移
 * top：上偏移
 * rotation：旋转角度
 */
function addMarker(map, point, imgPath, imgWidth, imgHeight, left, top, rotation) { // 创建图标对象   
	var myIcon = new BMap.Icon(imgPath, new BMap.Size(imgWidth, imgHeight), {
		// 设置图片偏移。   
		// 当您需要从一幅较大的图片中截取某部分作为标注图标时，您   
		// 需要指定大图的偏移位置，此做法与css sprites技术类似。    
		imageOffset: new BMap.Size(0, 0) // 设置图片偏移    
	});
	// 创建标注对象并添加到地图   
	var marker = new BMap.Marker(point, {
		icon: myIcon,
		offset: new BMap.Size(left, top), //偏移
		rotation: rotation //旋转
	});
	map.addOverlay(marker);

	//点击事件
	marker.addEventListener("click", function(e) {
		var lat = this.point.lat;
		var lng = this.point.lng;
		var carInfo = getCarInfo(lat, lng);
		getEqptByCarid(carInfo.carId,carInfo.licenseNum);
	});
	return marker;
}

/*
 * 通过经纬度找到对应的信息
 */
function getCarInfo(lat, lng) {
	var v;
	dataList.forEach(function(car) {
		if(car.currentEqpt && car.currentEqpt.longitude == lng && car.currentEqpt.latitude == lat) {
			v = car;
		}
	});
	return v;
}


/*
 * 设备选择框出现、影藏
 * show:true/false
 */
function selectEquipmentBox(show) {
	if(show) {
		$("#modelBack").show();
		$("#selectEquipment").css("bottom", "0px");
		$("#selectEquipment").css("height", selectEquipmentHeight + "px");
	} else {
		$("#selectEquipment").css("bottom", "0px");
		$("#selectEquipment").css("height", "0px");
		setTimeout(function() {
			$("#modelBack").hide();
		}, 500);
	}
}





