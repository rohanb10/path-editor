var defaultMapOptions = {
	zoom: 2,
	maxZoom: 18,
	minZoom: 2,
	mapType: 'roadmap',
	zoomControl: true,
	center: {lat: 0.0, lng: 0.0},
	precision: 5,
	disableDoubleClickZoom: true,
	clickableIcons: false,
	fullscreenControl: false,
	strokeColorNum: 3,
	styles: {
		featureType: 'poi.business',
		stylers: [{visibility: 'off'}],
	}
}
var mapOptions = {};

function loadPrefs() {
	document.getElementById('min-zoom').value = mapOptions.minZoom;
	document.getElementById('max-zoom').value = mapOptions.maxZoom;
	document.getElementById('cord-precision').value = mapOptions.precision;
	document.getElementById('map-type').selectedIndex = mapOptions.mapType;
	document.getElementById('path-color').dataset.color = mapOptions.strokeColorNum;
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
	var mapType = mt.options[mt.selectedIndex].value;
	if (mapOptions.mapType !== mapType){
		map.setMapTypeId(mt.options[mt.selectedIndex].value);
		newOptions.mapType = mt.selectedIndex;
	}

	newOptions.strokeColorNum = document.getElementById('path-color').dataset.color;
	if (path) path.setOptions({strokeColor: getColorFromNum(newOptions.strokeColorNum)});

	map.setOptions(newOptions);
	Object.keys(newOptions).forEach(no => {
		cookie.set(no, newOptions[no], {expires: 14})
	});
	Object.assign(mapOptions,newOptions);
	closeDrawer();
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
