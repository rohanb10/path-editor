var map, path = null, hoverPoly = null, preview = null, shape = null, shapeBounds = [];;

function initialize() {
	// check map options with cookie
	setMapOptions();
	map = new google.maps.Map(document.getElementById('map'), mapOptions);
	map.addListener('tilesloaded', () => {
		setTimeout(() => document.querySelectorAll('.gm-style-cc').forEach(gm => gm.style.display = 'none'), 150);
	});
}

function setMapOptions() {
	var availableOptions = ['minZoom','maxZoom','precision','mapType','zoomControl', 'strokeColorNum'];
	Object.assign(mapOptions, defaultMapOptions);
	if (Object.keys(cookie.all()).length === 0) {
		availableOptions.forEach(o => cookie.set(o, defaultMapOptions[o], {expires: 14}));
	} else {
		Object.keys(cookie.all()).forEach(o => {
			var val = cookie.get(o);
			mapOptions[o] = val === 'true' ? true : val === 'false' ? false : val;
		});
	}
}

function fitPathInViewport() {
	var bounds = new google.maps.LatLngBounds();
	path.getPath().forEach(function(e){
		bounds.extend(e);
	})
	map.fitBounds(bounds);
}

function render(poly) {
	console.log('render\n',poly);
	if (path !== null) path.setMap(null);
	path = new google.maps.Polyline({
		path: getLatLngArrayFromPolyline(poly, mapOptions.precision),
		strokeColor: getColorFromNum(mapOptions.strokeColorNum),
		strokeOpacity: 1.0,
		strokeWeight: 4,
		map: map
	});
	fitPathInViewport();
}

function toggleListeners(value) {
	if (value) {
		google.maps.event.addListener(path, 'click', (e) => {
			if (e.vertex == undefined) return;
			removeVertex(path.getPath(), e.vertex);
		});
		google.maps.event.addListener(map, "rightclick", (e) => drawShape(e));
	} else {
		google.maps.event.clearListeners(map, 'click');
		google.maps.event.clearListeners(map, 'rightclick');
		google.maps.event.clearListeners(map, 'mousemove');
	}

}

function getLatLngArrayFromPolyline(poly, precision = 5) {
	var latLng = polyline.decode(poly, precision);
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

function destroyEditingTools() {
	if (preview !== null) {
		preview.remove();
		preview = null;
	}
	
	if (hoverPoly !== null) {
		hoverPoly.setMap(null);
		hoverPoly = null;
	}

	if (shape !== null) {
		shape.setMap(null);
		shape = null;	
	}

	shapeBounds = [];
}

function destroyPath() {
	destroyEditingTools()
	toggleListeners(false);

	if (path != null) {
		path.setMap(null);
		path = null;
	}
	pathModified = false;
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

function getCordsFromPath(p, precision = 5) {
	var latLng = [];
	var pp = p.getPath();
	for (var i = 0; i < pp.length; i++){
		latLng.push([pp.getAt(i).lat().toFixed(precision), pp.getAt(i).lng().toFixed(precision)]);
	};
	return latLng;
};

function exportCords(array, type, newlines = false) {
	var s = '';
	console.log(type);
	if (type === 'csv') {
		array.forEach(a => s += a + '\r\n');
		return s;
	}
	if (type === 'arr') {
		array.forEach(a => {
			s += '[' + a + '],' + (newlines ? '\r\n' : '');
		});	
	}
	if (type === 'obj') {
		array.forEach(a => {
			s += '{x:' + a[0] + ', y:' + a[1] + '},' + (newlines ? '\r\n' : '');
		})
	}
	if (!newlines && s.charAt(s.length - 1) === ',') s = s.slice(0, -1);
	if (newlines && s.charAt(s.length - 2) === ',') s = s.slice(0, -2) + '\r\n';
	return s;
}

/*
 *	
 *	EDITING
 *
 */
var pathModified = false;
function removeVertex(p, vertex) {
	if (!p || vertex == undefined) return;
	if (vertex === 0 || vertex === p.length - 1) return;
	pathModified = true;
	p.removeAt(vertex);
}

// double clicks to draw shape
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

google.maps.event.addDomListener(window, 'load', initialize);