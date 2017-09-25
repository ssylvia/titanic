dojo.require("esri.map");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.arcgis.utils");
dojo.require("esri.IdentityManager");
dojo.require("dijit.dijit");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.StackContainer");
dojo.require("esri.dijit.Popup");

var _map, _loc, _path, _dest, _class = 0, _survived = 500, _perished = 817, _pieChart, boarded = false, _zooming = false, _mapLoaded = false;

function initMap() {

	var initExtent = new esri.geometry.Extent(-13736651.22718194,-1457807.0034545301,5439870.428997962,14079089.113899393, new esri.SpatialReference({ wkid:102100 }));

	var lods = [
			{"level" : 1, "resolution" : 39135.7584820001, "scale" : 147914381.897889},
  			{"level" : 2, "resolution" : 19567.8792409999, "scale" : 73957190.948944},
  			{"level" : 3, "resolution" : 9783.93962049996, "scale" : 36978595.474472},
			{"level" : 4, "resolution" : 4891.96981024998, "scale" : 18489297.737236},
  			{"level" : 5, "resolution" : 2445.98490512499, "scale" : 9244648.868618},
			{"level" : 6, "resolution" : 1222.99245256249, "scale" : 4622324.434309},
			{"level" : 7, "resolution" : 611.49622628138, "scale" : 2311162.217155}
		];

	_map = new esri.Map("map",{
		extent:initExtent,
		wrapAround180: false,
		lods:lods
	});

	var basemap = new esri.layers.ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer");
    _map.addLayer(basemap);

	var labels = new esri.layers.ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer");
    _map.addLayer(labels);

	_loc = new esri.layers.GraphicsLayer();
	_map.addLayer(_loc);

	_dest = new esri.layers.GraphicsLayer();
	_map.addLayer(_dest);

	_path = new esri.layers.GraphicsLayer();
	_map.addLayer(_path)

	passengerGraphics();
	addRoute();

	dojo.connect(dijit.byId('map'), 'resize', _map,_map.resize);

	dojo.connect(_map,"onUpdateEnd",function(){
		hideLoader();
	});
	dojo.connect(_map,"onPanEnd",function(){
		if (_zooming == true){
			_zooming = false;
			addTooltips();
		}
	});
	dojo.connect(_map,"onZoomEnd",function(){
		if (_zooming == true){
			_zooming = false;
			addTooltips();
		}
	});
	dojo.connect(_map,"onPanStart",function(){
		$("#hometown").hide();
		$("#destination").hide();
		$("#boarded").hide();
		$("#htArrow").hide();
		$("#bdArrow").hide();
		$("#dstArrow").hide();
	});
	dojo.connect(_map,"onZoomStart",function(){
		$("#hometown").hide();
		$("#destination").hide();
		$("#boarded").hide();
		$("#htArrow").hide();
		$("#bdArrow").hide();
		$("#dstArrow").hide();
	});
	dojo.connect(_map,"onExtentChange",function(){
		if (_zooming == false){
			moveTooltips();
		}

	});
	dojo.connect(_path,"onMouseOver",function(event){
		setInfoWindow(event.graphic);
		if (!$.browser.msie){
			if (event.graphic.geometry.type == "point"){
				event.graphic.setSymbol(event.graphic.symbol.setSize(event.graphic.symbol.size+4));
			}
		}
		var pt = _map.toScreen(event.mapPoint);
		hoverInfoPos(pt.x,pt.y,event.graphic.symbol.size);
	});
	dojo.connect(_path,"onMouseOut",function(){
		$("#hoverInfo").hide();
		if (!$.browser.msie){
			if (event.graphic.geometry.type == "point"){
				event.graphic.setSymbol(event.graphic.symbol.setSize(event.graphic.symbol.size-4));
			}
		}
	});

	dojo.connect(_loc,"onMouseOver",function(event){
		if (iPad == false){
			_map.setCursor('pointer');
			event.graphic.setSymbol(event.graphic.symbol.setSize(event.graphic.symbol.size+4).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new dojo.Color([0,0,0,0.3]), 1)));
			$("#hoverInfo").html(event.graphic.attributes[0].Orig_Addr)
			var pt = _map.toScreen(event.graphic.geometry);
			hoverInfoPos(pt.x,pt.y,event.graphic.symbol.size);
		}
	});
	dojo.connect(_loc,"onMouseOut",function(event){
		if (iPad == false){
			_map.setCursor('default');
			event.graphic.setSymbol(event.graphic.symbol.setSize(event.graphic.symbol.size-4).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new dojo.Color([0,0,0,0.0]), 1)));
			$("#hoverInfo").hide();
		}
	});
	dojo.connect(_loc,"onClick",function(event){
		passengerTable(event.graphic.attributes);
		$("#info").hide();
		$("#disclaimer").hide();
		$("#passCon").show();
		$("#passConHeader").show();
		_dest.clear();
		$("#hometown").hide();
		$("#destination").hide();
		$("#boarded").hide();
		$("#htArrow").hide();
		$("#bdArrow").hide();
		$("#dstArrow").hide();

		if (iPad == true){
			event.graphic.setSymbol(event.graphic.symbol.setSize(event.graphic.symbol.size+4).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new dojo.Color([0,0,0,0.3]), 1)));
			$("#hoverInfo").html(event.graphic.attributes[0].Orig_Addr)
			var pt = _map.toScreen(event.graphic.geometry);
			hoverInfoPos(pt.x,pt.y,event.graphic.symbol.size);

			setTimeout(function(){
				event.graphic.setSymbol(event.graphic.symbol.setSize(event.graphic.symbol.size-4).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new dojo.Color([0,0,0,0.0]), 1)));
				$("#hoverInfo").hide();
			},3000);
		}

	});
}

function hideLoader(){
	if (_mapLoaded == false){
		$("#loadingCon").hide();
		$(".passSelector").css("width","25%");
		$("#passSelectorCon").fadeTo(300,1.0);;
		dijit.byId("mainWindow").layout();
		_mapLoaded = true;
		clearPassengers();
	}
}

function addRoute(){
	dojo.forEach(_route.features,function(ftr,i){

		var polylineJson = {
		  "paths":ftr.geometry.paths,
		  "spatialReference":{"wkid":102100}
		};

		var polyline = new esri.geometry.Polyline(polylineJson);

		var sls = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
  				  new dojo.Color([50,50,250]), 1);

		if(ftr.attributes.Name == "Belfast to Southampton"){
			sls = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DOT,
  				  new dojo.Color([20,20,20]), 1);
		}

		var attr = ftr.attributes;

		_path.add(new esri.Graphic(polyline,sls,attr));
	});

	dojo.forEach(_predicted.features,function(ftr,i){

		var polylineJson = {
		  "paths":ftr.geometry.paths,
		  "spatialReference":{"wkid":102100}
		};

		var polyline = new esri.geometry.Polyline(polylineJson);

		var sls = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH,
  				  new dojo.Color([20,20,20]), 1);
		if(ftr.attributes.Name == "\"The Corner\" to collision site"){
			sls = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
  				  new dojo.Color([50,50,250]), 1);
		}

		var attr = ftr.attributes;

		_path.add(new esri.Graphic(polyline,sls,attr));
	});

	//Invisible Lines
	dojo.forEach(_route.features,function(ftr,i){

		var polylineJson = {
		  "paths":ftr.geometry.paths,
		  "spatialReference":{"wkid":102100}
		};

		var polyline = new esri.geometry.Polyline(polylineJson);

		var sls = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
  				  new dojo.Color([255,50,250,0]), 7);

		var attr = ftr.attributes;

		_path.add(new esri.Graphic(polyline,sls,attr));
	});

	dojo.forEach(_predicted.features,function(ftr,i){

		var polylineJson = {
		  "paths":ftr.geometry.paths,
		  "spatialReference":{"wkid":102100}
		};

		var polyline = new esri.geometry.Polyline(polylineJson);

		var sls = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
  				  new dojo.Color([255,20,20,0]), 7);

		var attr = ftr.attributes;

		_path.add(new esri.Graphic(polyline,sls,attr));
	});
	//Invisible Lines End

	dojo.forEach(_majorPoints,function(ftr,i){

		var pt = new esri.geometry.Point(ftr.x, ftr.y, new esri.SpatialReference({ wkid: 102100 }))

		var sym = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_X, 10,
			      new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
			      new dojo.Color([200,30,30]), 3),
			      new dojo.Color([0,255,0,0.25]));

		if (ftr.name == "corner"){
			sym = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 5,
			      new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
			      new dojo.Color([0,0,0]), 1),
			      new dojo.Color([50,50,50,0.75]));
		}

		var attr = ftr.name;

		_path.add(new esri.Graphic(pt,sym,attr));
	});

	dojo.forEach(_points.features,function(ftr,i){

		var pt = new esri.geometry.Point(ftr.geometry.x, ftr.geometry.y, new esri.SpatialReference({ wkid: 102100 }))

		var sym = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 5,
			      new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
			      new dojo.Color([0,0,0]), 1),
			      new dojo.Color([50,50,50,0.75]));

		var attr = ftr.attributes;

		_path.add(new esri.Graphic(pt,sym,attr));
	});
}

function passengerGraphics(){

	_loc.clear();

	dojo.forEach(_locations,function(graphic,i){

		if(graphic.longitude != 0 && graphic.latitude != 0){

			if (graphic.location != 'Unknown'){

				var size = 8;
				if (iPad == true){
					size = 18;
				}

				var passengers = [];

				var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(graphic.longitude,graphic.latitude));

				if (_class == 0){
					dojo.forEach(_masterList,function(passenger,i){
						if (passenger.Orig_Addr == graphic.location){
							passengers.push(passenger);
							size++;
						}
					});
				}
				else if (_class == 1){
					dojo.forEach(_masterList,function(passenger,i){
						if (passenger.Orig_Addr == graphic.location && passenger.Class == "First"){
							passengers.push(passenger);
							size++;
						}
					});
				}
				else if (_class == 2){
					dojo.forEach(_masterList,function(passenger,i){
						if (passenger.Orig_Addr == graphic.location && passenger.Class == "Second"){
							passengers.push(passenger);
							size++;
						}
					});
				}
				else {
					dojo.forEach(_masterList,function(passenger,i){
						if (passenger.Orig_Addr == graphic.location && passenger.Class == "Third"){
							passengers.push(passenger);
							size++;
						}
					});
				}

				var symSize = Math.pow(size,0.8);

				var sym = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, symSize,
						  new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
						  new dojo.Color([0,0,0,0.0]), 1),new dojo.Color([26,57,106,0.45]));

				if (iPad == true){
					if (size > 18){
						_loc.add(new esri.Graphic(pt,sym,passengers));
					}
				}
				else {
					if (size > 8){
						_loc.add(new esri.Graphic(pt,sym,passengers));
					}
				}

			}

		}

	});

	sortGraphicsBySize(_loc);
}

function destGraphics(locations){

	_dest.clear();

	var dest = [];

	dest.push(locations.Orig_Addr);
	dest.push(locations.Boarded);
	dest.push(locations.Dest_Addr);

	dojo.forEach(dest,function(dst,i){

		var symSize = 5;
		var pt;
		var attr;

		dojo.forEach(_locations,function(loc){
			if (loc.location == dst){
				pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(loc.longitude,loc.latitude));
				attr = {"location":dst,"lng":loc.longitude,"lat":loc.latitude, "info":locations, "pos":i};
			}
		});
		dojo.forEach(_destOnly,function(loc){
			if (loc.location == dst){
				pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(loc.longitude,loc.latitude));
				attr = {"location":dst,"lng":loc.longitude,"lat":loc.latitude, "info":locations, "pos":i};
			}
		});
		dojo.forEach(_boarded,function(loc){
			if (loc.location == dst){
				pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(loc.longitude,loc.latitude));
				attr = {"location":dst,"lng":loc.longitude,"lat":loc.latitude, "info":locations, "pos":i};
			}
		});

		var sym = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, symSize,
				  new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
				  new dojo.Color([152,18,18,0.7]), symSize),new dojo.Color([203,37,37,0.25]));

		if (pt != null){
			if (pt.x != 0 && pt.x !=0){
				_dest.add(new esri.Graphic(pt,sym,attr));
			}
		}

	});
	var extent = getGraphicsExtent(_dest.graphics).expand(1.3);
	_map.setExtent(extent);
	$("#hometown").empty().hide();
	$("#destination").empty().hide();
	$("#boarded").empty().hide();
	$("#htArrow").hide();
	$("#bdArrow").hide();
	$("#dstArrow").hide();
	_zooming = true;
	setTimeout(function() {
		if (!_map.extent.contains(getGraphicsExtent(_dest.graphics))) {
			_map.setExtent(getGraphicsExtent(_dest.graphics).expand(1.4));
		}
	},500);
}

function sortGraphicsBySize(ary){
	ary.graphics.sort(function(a,b){
		return b.symbol.size - a.symbol.size
	});
}

function getGraphicsExtent(graphics) {
	// accepts an array of graphic points and returns extent
	var minx = Number.MAX_VALUE;
	var miny = Number.MAX_VALUE;
	var maxx = Number.MIN_VALUE;
	var maxy = Number.MIN_VALUE;
	var graphic;
	for (var i = 0; i < graphics.length; i++) {
		graphic = graphics[i];
		if (graphic.geometry.x > maxx) maxx = graphic.geometry.x;
		if (graphic.geometry.y > maxy) maxy = graphic.geometry.y;
		if (graphic.geometry.x < minx) minx = graphic.geometry.x;
		if (graphic.geometry.y < miny) miny = graphic.geometry.y;
	}
	var sPt = _map.toMap({"x":0,"y":0});
	var ePt = _map.toMap({"x":40,"y":150});
	minx = minx - Math.abs(sPt.x - ePt.x);
	maxx = maxx + Math.abs(sPt.x - ePt.x);
	miny = miny - Math.abs(sPt.y - ePt.y);
	maxy = maxy + Math.abs(sPt.y - ePt.y);
	var extent = new esri.geometry.Extent({"xmin":minx,"ymin":miny,"xmax":maxx,"ymax":maxy,"spatialReference":{"wkid":102100}});
	return extent.expand(1.17);
}

function setInfoWindow(ftr){
	if (ftr.attributes == "corner"){
		$("#hoverInfo").html("The Corner: Westbound ships typically changed course at this imaginary point");
	}
	else if (ftr.attributes == "wreck"){
		$("#hoverInfo").html("<em>Titanic</em> hits iceberg around 11:40 p.m. April 14; sinks less than three hours later");
	}
	else if (ftr.attributes.Text){
		$("#hoverInfo").html(ftr.attributes.Text);
	}
}
