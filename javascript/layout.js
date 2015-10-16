var pasConOver = false;
var textOver = false;

var lifeboat = function (arg){
	if (arg == ""){
		return "none listed"
	}
	else{
		return arg
	}
}


var boardedTest = function(bd){
	if (bd == "Belfast" || bd == "Southampton" || bd == "Cherbourg" || bd == "Queenstown"){
		return bd
	}
	else{
		return "Southampton"
	}
}

$(document).ready(function(e) {	
	$("#passSelectorCon").fadeTo(1,0.0001);
	$(".passengerContent").mouseover(function(e) {
        pasConOver = true;
    });
	$(".text").mouseover(function(e) {
        textOver = true;
    });
	$("#toggle0").mouseover(function(e) {
		if (iPad == false){
			$(".passengerContent").stop(true,true).slideUp();
			$("#selectAllContent").stop(true,true).slideDown();
		}
    });
	$("#toggle1").mouseover(function(e) {
		if (iPad == false){
			$(".passengerContent").stop(true,true).slideUp();
			$("#selectFirstContent").stop(true,true).slideDown();
		}
    });
	$("#toggle2").mouseover(function(e) {
		if (iPad == false){
			$(".passengerContent").stop(true,true).slideUp();
			$("#selectSecondContent").stop(true,true).slideDown();
		}
    });
	$("#toggle3").mouseover(function(e) {
		if (iPad == false){
			$(".passengerContent").stop(true,true).slideUp();
			$("#selectThirdContent").stop(true,true).slideDown();
		}
    });
	$(".passengerContent").mouseout(function(e) {
        pasConOver = false;
    });
	$(".text").mouseout(function(e) {
        textOver = false;
    });
	$("#header").mouseover(function(e) {
        $(".passengerContent").slideUp();
    });
	$("#leftPane").mouseover(function(e) {
        $(".passengerContent").slideUp();
    });
	$("#map").mousemove(function(e) {
        if (pasConOver == false && textOver == false){
			$(".passengerContent").slideUp();
		}
    });
	$(".passSelector").click(function(e) {
		clearPassengers();
		if (!$(this).hasClass("selected")){
			$(".passSelector").removeClass('selectedClass');
			$(this).addClass("selectedClass");
		}
		if (iPad == true){
			$(".passengerContent").slideUp();
			if ($(this).attr("id") == "toggle0"){
				$("#selectAllContent").slideDown();
				setTimeout (function(){
					$("#selectAllContent").slideUp();
				},5000);
			}
			if ($(this).attr("id") == "toggle1"){
				$("#selectFirstContent").slideDown();
				setTimeout (function(){
					$("#selectFirstContent").slideUp();
				},5000);
			}
			if ($(this).attr("id") == "toggle2"){
				$("#selectSecondContent").slideDown();
				setTimeout (function(){
					$("#selectSecondContent").slideUp();
				},5000);
			}
			if ($(this).attr("id") == "toggle3"){
				$("#selectThirdContent").slideDown();
				setTimeout (function(){
					$("#selectThirdContent").slideUp();
				},5000);
			}
		}
    });
	
	$("#passCon").scroll(function(e) {
        $("#selectArrow").css("top",$(".passSelected").position().top);
		if($(".passSelected").position().top < 96){
			$("#selectArrow").hide();
		}
		else{
			$("#selectArrow").show();
		}
    });
	createPieChart();
	
});

var returnClass = function(){
	_survived = 0;
	_perished = 0;
	if (_class == 0){
		dojo.forEach(_masterList,function(passenger,i){
			if (passenger.Survived_text == "Survived"){
				_survived++;
			}
			if (passenger.Survived_text == "Died"){
				_perished++
			}
		});
		return "Passengers";
	}
	else if (_class == 1){
		dojo.forEach(_masterList,function(passenger,i){
			if(passenger.Class == "First"){
				if (passenger.Survived_text == "Survived"){
					_survived++;
				}
				if (passenger.Survived_text == "Died"){
					_perished++
				}
			}
		});
		return "First class passengers";
	}
	else if (_class == 2){
		dojo.forEach(_masterList,function(passenger,i){
			if(passenger.Class == "Second"){
				if (passenger.Survived_text == "Survived"){
					_survived++;
				}
				if (passenger.Survived_text == "Died"){
					_perished++
				}
			}
		});
		return "Second class passengers";
	}
	else if (_class == 3){
		dojo.forEach(_masterList,function(passenger,i){
			if(passenger.Class == "Third"){
				if (passenger.Survived_text == "Survived"){
					_survived++;
				}
				if (passenger.Survived_text == "Died"){
					_perished++
				}
			}
		});
		return "Third class passengers";
	}
}

function createPieChart(){
	var data = [
		{ label: "Survived",  data: _survived, color:"#98afd8"},
		{ label: "Died",  data: _perished, color:"#7989a3"}
	];
	
	$.plot($("#pieChart"), data,
{
        series: {
            pie: { 
                show: true,
				label: {
					show: false
				},
				stroke: {
					width:1,
					color:"#98afd8"
				}
            }
        },
        legend: {
            show: false
        }
});
}

function addCommas(numStr){
	return numStr.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
}

function layoutStartup(){
	$("#title").html(configOptions.title);
	$("#subtitle").html(configOptions.subtitle);
}

function selectClass(arg){
	_class = arg;
	passengerGraphics();
	$("#allPassText").html(returnClass(_class));
	setTimeout(function(){
		$("#allPassCount").html(addCommas(_survived+_perished));
		$("#surPassCount").html(addCommas(_survived));
		$("#perPassCount").html(addCommas(_perished));
		$("#pieChart").empty();
		createPieChart();
	},100);
}

function passengerTable(passengers){
	$("#passCon").empty();
	
	$("#selectArrow").hide();
	
	dojo.forEach(passengers,function(psg,i){
	
		$("#passCon").append("<div id='pass"+i+"' class='pass'><span id='passName"+i+"' class='passName'>"+psg.Title+" "+psg.First_Name+" "+psg.Last_Name+"</span></div>");
		$("#passCon").append("<div id='passText"+i+"' class='passText'><span id='passInfo"+i+"' class='passInfo'><strong>Hometown:</strong> "+psg.Orig_Addr+"<br /><strong>Boarded At:</strong> "+boardedTest(psg.Boarded)+"<br /><strong>Intended Destination:</strong> "+psg.Dest_Addr+"<br /><strong>Age:</strong> "+psg.Age+"<br /><strong>Class:</strong> "+psg.Class+"<br /><strong>Outcome:</strong> "+psg.Survived_text+"<br /><strong>Lifeboat:</strong> "+lifeboat(psg.Lifeboat)+"</span></div>");
		
		if (psg.Survived_text == "Survived"){
			$("#pass"+i).append("<span class='surBox'></span>");
		}
		else{
			$("#pass"+i).append("<span class='perBox'></span>");
		}
		
		$("#pass"+i).data("info",psg);
		
	});
	$("#selectArrow").css("top",96);
	$("#pass"+(passengers.length-1)).addClass("last");
	var id = $("#pass"+(passengers.length-1)).attr("id");
	
	$(".pass").mouseover(function(e) {
		if ($(this).hasClass("passSelected") == false){
			$(".pass").removeClass("passActive");
			$(this).addClass("passActive");
		}
    });
	
	$(".pass").mouseout(function(e) {
		if ($(this).hasClass("passSelected") == false){
			$(".pass").removeClass("passActive");
		}
    });
	
	$(".pass").click(function(e) {
		if ($(this).hasClass("passSelected") == false){
			$(".pass").removeClass("passSelected");
			$(this).addClass("passSelected");
			destGraphics($(this).data('info'));
			$(".passText").slideUp("fast");
			$(this).next().slideDown("fast");
			if ($(this).attr("id") == id){
				$(this).css("border-bottom","none");
				$(this).next().css("border-bottom","1px #7989a3 solid");
			}
			else{
				$("#"+id).css("border-bottom","1px #7989a3 solid");
				$("#passText"+passengers.length-1).next().css("border-bottom","none");
			}
			if (!$("#selectArrow").is(":visible")) {
				setTimeout(function(){
					$("#selectArrow").css("top",$(".passSelected").position().top).show();
				},201);
			}
			else if (($("#selectArrow").position().top) < ($(".passSelected").position().top)){
				$("#selectArrow").css("top",$(".passSelected").position().top);
				$("#selectArrow").animate({top: $(".passSelected").position().top - 140},200);
			}
			else{
				$("#selectArrow").css("top",$(".passSelected").position().top);
			}
			$(this).removeClass("passActive");
		}
    });
}

function addTooltips(){
	$("#hometown").empty().hide();
	$("#destination").empty().hide();
	$("#boarded").empty().hide();
	$("#htArrow").hide();
	$("#bdArrow").hide();
	$("#dstArrow").hide();
	var info = _dest.graphics[0].attributes.info;
	if (info.Dest_Addr == info.Orig_Addr){
		$("#hometown").append("<span class='ht'>Hometown: "+info.Orig_Addr+"</span><br /><span class='dst'>Intended Destination: "+info.Dest_Addr+"</span>");
		$("#boarded").append("<span class='brd'>Boarded the Titanic in: "+info.Boarded+"</span>");
		_dest.graphics[2].hide();
	}
	else{
		$("#hometown").append("<span class='ht'>Hometown: "+info.Orig_Addr+"</span>");
		$("#destination").append("<span class='dst'>Intended Destination: "+info.Dest_Addr+"</span>");
		$("#boarded").append("<span class='brd'>Boarded the Titanic in: "+info.Boarded+"</span>");
	}
	moveTooltips();	
}

function clearPassengers(){
	$("#passCon").hide();
	$("#passConHeader").hide();
	$("#info").show();
	$("#disclaimer").show();
	_dest.clear();
	$("#hometown").hide();
	$("#destination").hide();
	$("#boarded").hide();
	$("#htArrow").hide();
	$("#bdArrow").hide();
	$("#dstArrow").hide();
	$("#selectArrow").css("top",30).hide();
}

function moveTooltips(){
	if ($("#hometown").html() != "" && $("#boarded").html() != ""){
		var htHeight = $("#hometown").height();
		var htWidth = $("#hometown").width();
		var bdHeight = $("#boarded").height();
		var bdWidth = $("#boarded").width();
		var dstHeight = $("#destination").height();
		var dstWidth = $("#destination").width();
		var htPos,bdPos,dstPos;
		var scrPts = [];
		dojo.forEach(_dest.graphics,function(dPt,i){
			if (dPt.attributes.pos == 0){
				htPos = _map.toScreen(dPt.geometry)
			}
			if (dPt.attributes.pos == 1){
				bdPos = _map.toScreen(dPt.geometry)
			}
			if (dPt.attributes.pos == 2){
				dstPos = _map.toScreen(dPt.geometry)
			}
		});
		
		if (htPos != null && bdPos != null && dstPos != null){
			if (htPos.x < ($(document).width()/2)){
				$("#hometown").css("left",htPos.x-30);
			}
			else{
				$("#hometown").css("left",htPos.x-htWidth+30);
			}
			if (bdPos.x < ($(document).width()/2)){
				$("#boarded").css("left",bdPos.x-30);
			}
			else{
				$("#boarded").css("left",bdPos.x-bdWidth+30);
			}
			if (dstPos.x < ($(document).width()/2)){
				$("#destination").css("left",dstPos.x-30);
			}
			else{
				$("#destination").css("left",dstPos.x-dstWidth+30);
			}
			if ((htPos.y - bdPos.y) < 100){
				$("#htArrow").css("top",htPos.y-49).css("left",htPos.x-10).show();
				$("#bdArrow").attr("src","images/tooltipBottom.png");
				$("#bdArrow").css("top",bdPos.y).css("left",bdPos.x-10).show();
				$("#hometown").css("top",(htPos.y-59-htHeight)).show();
				$("#boarded").css("top",(bdPos.y+49)).show();
			}
			else if ((htPos.y - bdPos.y) >= 100){
				$("#htArrow").css("top",htPos.y-49).css("left",htPos.x-10).show();
				$("#bdArrow").attr("src","images/tooltipTop.png");
				$("#bdArrow").css("top",bdPos.y-49).css("left",bdPos.x-10).show();
				$("#hometown").css("top",(htPos.y-59-htHeight)).show();
				$("#boarded").css("top",(bdPos.y-59-bdHeight)).show();
			}
			if (htPos.x != dstPos.x && htPos.y != dstPos.y){
				if ((dstPos.y - htPos.y) > 0 && (dstPos.y - bdPos.y) > 0){
					$("#dstArrow").attr("src","images/tooltipBottom.png");
					$("#dstArrow").css("top",dstPos.y).css("left",dstPos.x-10).show();
					$("#destination").css("top",(dstPos.y+49)).show();
				}
				else if ((htPos.y - dstPos.y) < 0 && (bdPos.y - dstPos.y) < 0){
					$("#dstArrow").attr("src","images/tooltipTop.png");
					$("#dstArrow").css("top",dstPos.y-49).css("left",dstPos.x-10).show();
					$("#destination").css("top",(dstPos.y-59-dstHeight)).show();
				}
				else{
					if ((dstPos.y - htPos.y) > 100 && (dstPos.y - bdPos.y) > 100){
						$("#dstArrow").attr("src","images/tooltipBottom.png");
						$("#dstArrow").css("top",dstPos.y).css("left",dstPos.x-10).show();
						$("#destination").css("top",(dstPos.y+49)).show();
					}
					else if ((dstPos.y - htPos.y) > 100 && (dstPos.y - bdPos.y) < 100){
						if ((htPos.y - bdPos.y) < 0){
							$("#dstArrow").attr("src","images/tooltipBottom.png");
							$("#dstArrow").css("top",dstPos.y).css("left",dstPos.x-10).show();
							$("#destination").css("top",(dstPos.y+49)).show();
						}
						else{
							$("#dstArrow").attr("src","images/tooltipTop.png");
							$("#dstArrow").css("top",dstPos.y-49).css("left",dstPos.x-10).show();
							$("#destination").css("top",(dstPos.y-59-dstHeight)).show();
						}
					}
					else if ((dstPos.y - htPos.y) < 100 && (dstPos.y - bdPos.y) > 100){
						if ((htPos.y - bdPos.y) > 0){
							$("#dstArrow").attr("src","images/tooltipBottom.png");
							$("#dstArrow").css("top",dstPos.y).css("left",dstPos.x-10).show();
							$("#destination").css("top",(dstPos.y+49)).show();
						}
						else{
							$("#dstArrow").attr("src","images/tooltipTop.png");
							$("#dstArrow").css("top",dstPos.y-49).css("left",dstPos.x-10).show();
							$("#destination").css("top",(dstPos.y-59-dstHeight)).show();
						}
					}
					else{
						$("#dstArrow").attr("src","images/tooltipBottomLong.png");
						$("#dstArrow").css("top",dstPos.y).css("left",dstPos.x-10).show();
						$("#destination").css("top",(dstPos.y+100)).show();
					}
				}
			}
	}
}
	
	/*
	dojo.forEach(_dest.graphics,function(dst,i){
		var pt = _map.toScreen(dst.geometry);
		if (dst.attributes.pos == 0){
			$("#htArrow").css("top",pt.y-49).css("left",pt.x-10).show();
			if (pt.x < ($(document).width()/2)){
				$("#hometown").css("top",(pt.y-59-htHeight)).css("left",pt.x-30).show();
			}
			else {
				$("#hometown").css("top",(pt.y-59-htHeight)).css("left",pt.x-htWidth+30).show();
			}
		}
		else if (dst.attributes.pos == 1){
			$("#bdArrow").css("top",pt.y-49).css("left",pt.x-10).show();
			if (pt.x < ($(document).width()/2)){
				$("#boarded").css("left",pt.x-30).css("top",(pt.y-59-bdHeight)).show();
			}
			else {
				$("#boarded").css("left",pt.x-bdWidth+30).css("top",(pt.y-59-bdHeight)).show();
			}
		}
		if ($("#destination").html() != ""){
			if (dst.attributes.pos == 2){
				$("#dstArrow").css("top",pt.y-49).css("left",pt.x-10).show();
				if (pt.x < ($(document).width()/2)){
					$("#destination").css("left",pt.x-30).css("top",(pt.y-59-dstHeight)).show();
				}
				else {
					$("#destination").css("left",pt.x-dstWidth+30).css("top",(pt.y-59-dstHeight)).show();
				}
			}
		}
	});
	*/
}
function loc2csv(){
	var newWindow = window.open();
	newWindow.document.write("ID,Title,First_Name,Middle_Name,Other_Name,Last_Name,Maiden_Name,Servant,Servant_type,Age,Orig_Addr,Class,Survived,Survived_text,Boarded,Dest_Addr,Lifeboat,Body,latitude,longitude<br />");
	dojo.forEach(_masterList,function(loc){
		var lt,lg;
		dojo.forEach(_locations,function(plc){
			if (plc.location == loc.Orig_Addr){
				console.log(plc);
				lt = plc.latitude;
				lg = plc.longitude;
			}
		});
		alert(lt);
		//newWindow.document.write(loc.location+"<br />");
		newWindow.document.write("'"+loc.ID+"','"+loc.Title+"','"+loc.First_Name+"','"+loc.Middle_Name+"','"+loc.Other_Name+"','"+loc.Last_Name+"','"+loc.Maiden_Name+"','"+loc.Servant+"','"+loc.Servant_type+"','"+loc.Age+"','"+loc.Orig_Addr+"','"+loc.Class+"','"+loc.Survived+"','"+loc.Survived_text+"','"+loc.Boarded+"','"+loc.Dest_Addr+"','"+loc.Lifeboat+"','"+loc.Body+"',"+lt+","+lg+"<br />");
	});
	/*
	var already = [];
	dojo.forEach(_locations,function(lox){
		already.push(lox.location);
	});
	var dest = [];
	for (i=0;i<_masterList.length;i++){
		if (($.inArray(_masterList[i].Dest_Addr,already)) == -1){
			if (($.inArray(_masterList[i].Dest_Addr,dest)) == -1){
				dest.push(_masterList[i].Dest_Addr);
			}
		}
	}
	dojo.forEach(dest,function(loc){
		newWindow.document.write(loc+"<br />");
		//newWindow.document.write("'"+loc.location+"',"+loc.latitude+","+loc.longitude+"<br />");
	});
	*/
}

function hoverInfoPos(x,y,size){
	if (size == null){
		size = 5;
	}
	if (x <= ($("#map").width())-230){
		$("#hoverInfo").css("left",x+(size/2 + 10));
	}
	else{
		$("#hoverInfo").css("left",x-(size/2 + 10)-($("#hoverInfo").width()));
	}
	if (y >= ($("#hoverInfo").height())+50){
		$("#hoverInfo").css("top",y-(size/2 + 5)-($("#hoverInfo").height()));
	}
	else{
		$("#hoverInfo").css("top",y-(size/2 + 5)+($("#hoverInfo").height()));
	}
	$("#hoverInfo").show();
}