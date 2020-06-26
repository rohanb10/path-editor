var defaultMapOptions = {
	zoom: 2,
	maxZoom: 18,
	minZoom: 2,
	mapTypeId: 'map_default',
	mapType: 0,
	zoomControl: true,
	center: {lat: 0.0, lng: 0.0},
	precision: 5,
	disableDoubleClickZoom: true,
	clickableIcons: false,
	fullscreenControl: false,
	strokeColorNum: 3,
	streetViewControl: false,
	mapTypeControl: false,
	mapTypeControlOptions: {
		mapTypeIds: ['map_default', 'satellite', 'hybrid', 'terrain', 'map_bones', 'map_sand', 'map_incognito']
	},
	// styles: {
	// 	featureType: 'poi',
	// 	stylers: [{visibility: 'off'}],
	// }
}
var mapOptions = {};

function loadPrefs() {
	document.getElementById('min-zoom').value = parseInt(mapOptions.minZoom);
	document.getElementById('max-zoom').value = parseInt(mapOptions.maxZoom);
	document.getElementById('cord-precision').value = parseInt(mapOptions.precision);
	document.getElementById('map-type').selectedIndex = mapOptions.mapType;
	document.getElementById('path-color').dataset.color = parseInt(mapOptions.strokeColorNum);
	document.querySelector(`.color-picker-tooltip .color-square[data-color="${mapOptions.strokeColorNum}"]`).classList.add('selected');
	document.getElementById('zoom-control').checked = mapOptions.zoomControl
}

function updatePrefs() {
	var newOptions = {}
	var min = parseInt(document.getElementById('min-zoom').value);
	var max = parseInt(document.getElementById('max-zoom').value);
	if (min >= max) {
		max = min + 1;
	}
	if (mapOptions.minZoom !== min) newOptions.minZoom = min;
	if (mapOptions.maxZoom !== max) newOptions.maxZoom = max;

	var p = parseInt(document.getElementById('cord-precision').value);
	if (mapOptions.precision !== p) newOptions.precision = p;

	var zc = document.getElementById('zoom-control').checked;
	if (mapOptions.zoomControl !== zc) newOptions.zoomControl = zc;

	var mt = document.getElementById('map-type');
	var mapTypeId = mt.options[mt.selectedIndex].value;
	if (mapOptions.mapTypeId !== mapTypeId){
		map.setMapTypeId(mapTypeId);
		newOptions.mapType = mt.selectedIndex;
		newOptions.mapTypeId = mapTypeId;
	}

	var sc = parseInt(document.getElementById('path-color').dataset.color);
	if (mapOptions.strokeColorNum !== sc) newOptions.strokeColorNum = sc;
	if (path && mapOptions.strokeColorNum !== sc) path.setOptions({strokeColor: getColorFromNum(newOptions.strokeColorNum)});

	if (Object.keys(newOptions).length > 0) {
		console.log('New options', newOptions);
		map.setOptions(newOptions);
		Object.keys(newOptions).forEach(no => {
			cookie.set(no, newOptions[no], {expires: 14})
		});
		Object.assign(mapOptions,newOptions);
	}
	closeDrawer();
	console.log('Fresh Cookie', cookie.all());
}

function openDrawer(el) {
	var footer = document.querySelector('.footer');
	if (footer.classList.contains('open')) return;
	footer.classList.add('open');
	el.classList.add('open');
	document.getElementById(el.dataset.name).classList.add('open');
	
	if (el.dataset.name === 'preferences') loadPrefs();
}

function closeDrawer() {
	document.querySelectorAll('.footer, .drawer div, .handle a').forEach(div => div.classList.remove('open'))
}

function getColorFromNum(num) {
	var rgb = getComputedStyle(document.querySelector(`.color-square[data-color="${num}"]`)).backgroundColor;
	// convert to hex
	return '#' + rgb.match(/\d+/g).map(y = z => ((+z < 16)?'0':'') + (+z).toString(16)).join('');;
}

function changePathColor(el) {
	document.getElementById('path-color').dataset.color = el.dataset.color;
	document.querySelector('.color-picker-tooltip .color-square.selected').classList.remove('selected');
	el.classList.add('selected');
}
