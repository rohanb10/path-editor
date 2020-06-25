class CorruptInput extends Error {
	constructor(butter, message = 'Error parsing input') {
		super(message)
		this.butter = butter;
		this.name = 'CorruptInput';
	}
}

const FILE_MAP = {
	csv: {
		type: 'CSV',
		placeholder: '37.76084,-122.42851\n37.76095,-122.42839\n37.76094,-122.42821\n...'
	},
	poly: {
		type: 'Polyline',
		placeholder: 'efneFlxfjViBeh@u@k@k_AhEipAgdB...'
	},
	cords: {
		type: 'Coordinates',
		placeholder: '[]'
	},
	json: {
		type: 'GeoJSON',
		placeholder: '{\n  "type":"LineString",\n  "coordinates":[\n    [-122.42851, 37.76084],\n    [-122.42839, 37.76095],\n    [-122.42821, 37.76094],\n    [-122.42800, 37.76096],\n    ....\n  ]\n}'
	},
	gpx: {
		type: 'GPX',
		placeholder: '<trkpt lat="18.974003" lon="72.805345">\n<trkpt lat="18.973853" lon="72.805601">\n<trkpt lat="18.973775" lon="72.805686">\n<trkpt lat="18.973625" lon="72.805680">\n...'
	},
}

function getFileType(lowerCase = true) {
	var fileType = document.querySelector('.file-type-selected').getAttribute('data-selected');
	if (fileType && !Object.values(FILE_MAP).find(f => f.type === fileType)) return null
	if (lowerCase) return fileType.toLowerCase();
	return fileType;
}

function changeFileType(el, message = 'n/a') {

	var fileType = document.querySelector('.file-type-selected');
	var type = el && el.dataset ? el.dataset.file: el;

	// remove previous selected file type
	if (fileType.querySelector('.selected')) fileType.querySelector('.selected').classList.remove('selected');

	// reset if type = null
	if (type === null) {
		fileType.setAttribute('data-selected', message)
		document.getElementById('input-text').setAttribute('placeholder', 'Select a format\nfor an example');
	} else {
		fileType.setAttribute('data-selected', type);
		var nextFileType = fileType.querySelector(`span[data-file="${type}"`)
		if (nextFileType) nextFileType.classList.add('selected')
		var placeholder = Object.values(FILE_MAP).find(f => f.type === type).placeholder;
		if (placeholder) document.getElementById('input-text').setAttribute('placeholder', placeholder);
	}
	unplug();
	goToStep(1, false);
}

function guessFileType(fileName) {
	var fileExt = fileName ? fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase() : '';
	// GPX, CSV, 
	if (Object.keys(FILE_MAP).indexOf(fileExt) > -1){
		changeFileType(FILE_MAP[fileExt].type)
		return;
	} else {
		changeFileType(null, 'Select File Type');
	}
}

function readInputFile() {
	var fileInput = document.getElementById('input-file');
	if (fileInput.files.length !== 1) {
		console.log('wtf');
		return;
	}
	toast('Parsing file');
	var reader = new FileReader();
	reader.onload = () => {
		var rr = reader.result;
		Object.assign(document.getElementById('input-text'), {disabled: true, value: rr});
		hideNextButton(1, false);
		guessFileType(document.getElementById('input-file').files[0].name)
	};
	reader.readAsText(document.getElementById('input-file').files[0]);
}

function removeDuplicates(cords) {
	// return cords;
	var newCords = []
	for (var i = 1; i < cords.length; i++) {
		if (!(cords[i][0] == cords[i-1][0] && cords[i][1] == cords[i-1][1])) newCords.push(cords[i])
	}
	return newCords;
}

function getCoordinatesFromGPX(gpx) {
	const regex_track = /<trkpt(\s*(lat|lon)="([-0-9\.]+)"){2}/g;
	const regex_latLng = /([-0-9\.]+)/g

	var trkpts = gpx.match(regex_track);
	if (!trkpts || trkpts.length <= 1) {
		toast(['Cannot find any coordinates', `Are you sure this is the <a target="blank" href="https://github.com/rohanb10/path-editor/blob/master/README.md#gpx">right file type</a>?`])
		return false;
	}

	var cords = getValidCoordinatesFromLines(trkpts);

	if (typeof cords === 'boolean' && !cords) return false;
	return removeDuplicates(cords);
}

function getCoordinatesFromCSV(csv) {
	const regex_line = /((-|\+)?\d{1,3}\.\d{0,7}){1,2}/g;
	
	var validLines = csv.match(regex_line);

	if (!validLines || validLines.length === 0) {
		toast(['Cannot find any coordinates', `Are you sure this is the <a target="blank" href="https://github.com/rohanb10/path-editor/blob/master/README.md#input-formats">right file type</a>?`])
		return false;
	}

	var cords = getValidCoordinatesFromLines(validLines);
	
	if (typeof cords === 'boolean' && !cords) return false;

	return removeDuplicates(cords);
}

function getCoordinatesFromGeoJSON(jsonString) {
	try{ 
		var json = JSON.parse(jsonString);

		if (json && Array.isArray(json)) {
			json = json.shift();
		}

		if (json && json.type === 'FeatureCollection' && json.features) {
			json = json.features;
		}

		if (json && Array.isArray(json)) {
			json = json.shift();
		}
		console.log(2, json)
		if (!json || !json.coordinates) {
			throw new CorruptInput(['No <a>coordinates</a> found in GeoJSON', 'Are you sure this is the <a target="blank" href="https://github.com/rohanb10/path-editor/blob/master/README.md#geojson">right file type</a>?']);
		}
		if (json && json.type !== 'LineString') {
			throw new CorruptInput(['No <a target="_blank" href="https://tools.ietf.org/html/rfc7946#section-3.1.4">LineString</a> found in GeoJSON','Are you sure this is the <a target="blank" href="https://github.com/rohanb10/path-editor/blob/master/README.md#geojson">right file type</a>?']);
		}
		
		var cords = [];
		json.coordinates.forEach(f => cords.push(f));
		
		if (cords.length === 0) {
			throw new CorruptInput(['No <a target="_blank" href="https://tools.ietf.org/html/rfc7946#section-3.1.4">LineStrings</a> found', 'Unable to preview GeoJSON']);
		}
		
		cords = getValidCoordinates(cords);

		if (typeof cords === 'boolean' && !cords) return false;
		return removeDuplicates(cords);
	}
	catch(e) {
		if(e instanceof CorruptInput) {
			toast(e.butter, -1);
		} else if(e instanceof SyntaxError) {
			toast(['Check if your <a target="_blank" href="http://json.parser.online.fr/">GeoJSON syntax</a> is valid', 'Cannot parse input'], -1)
		} else {
			toast(e.message, -1);
			console.warn(e, e.name, e.message);
		}
		console.log(jsonString)
		return false;
	}
}

function getValidCoordinates(cords, precision = 5) {
	var validCords = [];
	var allValid = true;
	cords.forEach(c => {

		if (c.length !== 2) {
			allValid = false;
			return;
		}

		var lng = parseFloat(c[0]).toFixed(precision);
		if (!(-180 <= lng && lng <= 180)){allValid = false; return;}
		var lat = parseFloat(c[1]).toFixed(precision);
		if (!(-90 <= lat && lat <= 90)){allValid = false; return;}

		validCords.push([lat,lng]);
	});
	if (validCords.length === 0) {
		toast('No vaild coordinates found', -1)
		return false;
	}
	if (!allValid) toast(['Some coordinates are <a>invalid</a>', 'They have been skipped'], 5000);
	return validCords;
}


function getValidCoordinatesFromLines(lines, precision = 5) {
	const regex_latLng = /([-0-9\.]+)/g

	var cords = [];
	var allValid = true;
	lines.forEach(l => {
		var latLng = l.match(regex_latLng);

		// corrupt file
		if (latLng.length !== 2) {
			toast(['Some coordinates are <a>invalid</a>', 'They have been skipped'], 5000)
			allValid = false;
			return;
		}
		// skip all lat long pairs with incorrect values
		var lat = parseFloat(latLng[0]).toFixed(precision);
		if (!(-90 <= lat && lat <= 90)){allValid = false; return;}
		var lng = parseFloat(latLng[1]).toFixed(precision);
		if (!(-180 <= lng && lng <= 180)){allValid = false; return;}

		cords.push([lat, lng]);
	});
	if (cords.length === 0) {
		toast('No vaild coordinates found', -1)
		return false;
	}
	if (!allValid) toast(['Certain coordinates are <a>invalid</a>', 'They have been skipped'], 5000)
	return cords;
}

var textInputLength = -1;
function uploaded(type, el) {
	document.querySelector('.reset').classList.remove('hidden');
	switch (type) {
		case 'file':
			// change file input label
			el.nextElementSibling.querySelector('span:last-of-type').innerText = el.value.split(String.fromCharCode(92)).pop()
			el.nextElementSibling.querySelector('span:first-of-type').classList.add('uploaded');
			// parseFile
			readInputFile()
			goToStep(1.5, false);
			break;
		case 'text':
			if (el.value.length > 0) {
				document.getElementById('input-file').disabled = true;
				guessFileType();
				if (el.value.length !== textInputLength){
					goToStep(1, textInputLength.length <= 0)
				}
				hideNextButton(1, false);
				return;
			}
			resetUploadForm();
			break;
		default:
			break;
	}
}
