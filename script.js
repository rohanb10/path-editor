var map;
var mapOptions = {
	zoom: 12,
	maxZoom: 18,
	minZoom: 10,
	mapType: 0,
	center: {lat: 37.7578, lng:-122.5076},
	disableDoubleClickZoom: true,
	clickableIcons: false,
	fullscreenControl: false,
	styles: {
		featureType: 'poi.business',
		stylers: [{visibility: 'off'}],
	}
};

function initialize() {
	map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);

function fitPathInViewport() {
	var bounds = new google.maps.LatLngBounds();
	path.getPath().forEach(function(e){
		bounds.extend(e);
	})
	map.fitBounds(bounds);
}

var path = null;
function render(poly, preview = false) {
	if (path !== null) path.setMap(null);
	path = new google.maps.Polyline({
		path: getLatLngArrayFromPolyline(poly),
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 4,
		map: map
	});
	fitPathInViewport();
	if (preview) return;
	google.maps.event.addListener(path, 'click', function(e) {
		if (e.vertex == undefined) return;
		removeVertex(path.getPath(), e.vertex);
	});

	google.maps.event.addListener(map, "rightclick", function(e) {
		drawShape(e)
	});
}

function getLatLngArrayFromPolyline(poly) {
	var latLng = polyline.decode(poly, 5);
	var arr = [];
	latLng.forEach(c => {
		arr.push(new google.maps.LatLng(c[0],c[1]));
	});
	return arr;
}

function escapePoly(p) {
	return p.split(String.fromCharCode(92)).join(String.fromCharCode(92,92));
}

function unescapePoly(p) {
	return p.split(String.fromCharCode(92,92)).join(String.fromCharCode(92));
}

/*
 *	
 *	EXPORTING
 *
 */

function getPolylineFromPath() {
	var p = polyline.encode(getCordsFromPath(path));
	// escape all backslashes
	p = p.split(String.fromCharCode(92)).join(String.fromCharCode(92,92));
	return p;
}

function getCordsFromPath(p) {
	var latLng = [];
	var pp = p.getPath();
	for (var i = 0; i < pp.length; i++){
		latLng.push([pp.getAt(i).lat().toFixed(5), pp.getAt(i).lng().toFixed(5)]);
	};
	return latLng;
};

function printable(array, type, newlines = false) {
	console.log(type);
	var s = '';
	if (type === 'arr') {
		array.forEach(a => {
			s += (newlines ? '\t' : '') + '[' + a + '],' + (newlines ? '\n' : '');
		});	
	}
	if (type === 'obj') {
		array.forEach(a => {
			s += (newlines ? '\t' : '') + '{x:' + a[0] + ', y:' + a[1] + '},' + (newlines ? '\n' : '');
		})
	}
	if (!newlines && s.charAt(s.length - 1) === ',') s = s.slice(0, -1);
	if (newlines && s.charAt(s.length - 2) === ',') s = s.slice(0, -2) + '\n';
	return s;
}

function csv(array) {
	var s = ''
	array.forEach(a => {
		s += a + ',\r\n'
	});
	return s;
}

/*
 *	
 *	EDITING
 *
 */

function removeVertex(p, vertex) {
	if (!p || vertex == undefined) {
		return;
	}
	p.removeAt(vertex);
}

// double clicks to draw shape
var poly, hoverPoly, preview, shape, shapeBounds = [];
function drawShape(e) {
	if (path == undefined) return;
	if (shapeBounds.length == 2) {
		shapeBounds = [];
		shape.setMap(null);
		return;
	}
	// Draw bounding shape
	var clickedCords = [parseFloat(e.latLng.lat().toFixed(5)),parseFloat(e.latLng.lng().toFixed(5))]
	shapeBounds.push(clickedCords);
	if (shapeBounds.length == 1) {
		preview = google.maps.event.addListener(map, 'mousemove', (e) => {
			if (hoverPoly) hoverPoly.setMap(null);
			var hoverCords = [
				parseFloat(e.latLng.lat().toFixed(5)),
				parseFloat(e.latLng.lng().toFixed(5))
			];
			hoverPoly = new google.maps.Polygon({
				map: map,
				fillOpacity: 0.1,
				strokeWeight: 0.9,
				strokeOpacity: 0.5,
				fillColor: "#FFF",
				strokeColor: "#FFF",
				clickable: false,
				paths: [
					{lat: clickedCords[0], lng: clickedCords[1]},
					{lat: clickedCords[0], lng: hoverCords[1]},
					{lat: hoverCords[0], lng: hoverCords[1]},
					{lat: hoverCords[0], lng: clickedCords[1]},
				],
			});
		});
	}
	if (shapeBounds.length == 2) {
		hoverPoly.setMap(null);
		preview.remove();
		shape = new google.maps.Polygon({
			map: map,
			fillOpacity: 0.3,
			strokeWeight: 0.9,
			clickable: true,
			fillColor: "#FFF",
			strokeColor: "#FFF",
			editable: true,
			paths: [
				{lat: shapeBounds[0][0], lng: shapeBounds[0][1]},
				{lat: shapeBounds[0][0], lng: shapeBounds[1][1]},
				{lat: shapeBounds[1][0], lng: shapeBounds[1][1]},
				{lat: shapeBounds[1][0], lng: shapeBounds[0][1]},
			],
		});
		google.maps.event.addListener(shape, "click", () => {
			var p = path.getPath();
			for (var i = 0; i < p.length; i++){
				var latLng = new google.maps.LatLng(p.getAt(i).lat(), p.getAt(i).lng())
				if (google.maps.geometry.poly.containsLocation(latLng, shape)) removeVertex(p, i);
			}
		});
	}
}