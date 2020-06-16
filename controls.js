// document.getElementById('polyline-text').value = 'gdneFdyfjVUW@c@Ci@e@kBUeBMwAYoKGgBMmBUgIOc@e@Gg@ByBLqBDmDP_Ll@sCHk@DgPp@oBJeARuB@uCLc@K_@]cFkH_BsBa@c@_CaDeC{CyKsOeBuB]g@S]uEeGiBkCy@eAIQWWcFcH{A{Bw@_AcDkEcBcC_DeEkCsDqD_F][e@Wa@[k@oAmAoBY_@a@[QQ_@Aa@@oBXi@Ca@BoAPy@TaC\\cAHq@XiCTa@DYJ_@F[KKSENq@Lo@DgBb@aAP{@FeC\\aBXu@Hu@NwBTwAVa@?c@Na@`@qB`DMJKCGFK\\Ud@W`@WV]@m@LQ?uAVk@F';
function openDrawer(name, handle) {
	var d = document.querySelector('.footer');
	if (d.classList.contains('open')) return;
	d.classList.add('open');
	document.getElementById(name).classList.add('open');
	handle.classList.add('open');
	if (name === 'preferences') {
		document.getElementById('min-zoom').value = mapOptions.minZoom;
		document.getElementById('max-zoom').value = mapOptions.maxZoom;
		document.getElementById('double-click').checked = mapOptions.disableDoubleClickZoom;
		document.getElementById('map-type').selectedIndex = mapOptions.mapType;
	}
}

function updatePrefs() {
	var newOptions = {}
	var min = parseInt(document.getElementById('min-zoom').value);
	var max = parseInt(document.getElementById('max-zoom').value);
	if (min < max) {
		if (mapOptions.minZoom !== min)  newOptions.minZoom = min;
		if (mapOptions.maxZoom !== max)  newOptions.maxZoom = max;	
	}

	var dbl = document.getElementById('double-click').checked;
	if (mapOptions.disableDoubleClickZoom !== dbl)  newOptions.disableDoubleClickZoom = dbl;

	var mt = document.getElementById('map-type');
	var mapType = mt.options[mt.selectedIndex].value;
	if (mapOptions.mapType !== mapType){
		map.setMapTypeId(mt.options[mt.selectedIndex].value);
		newOptions.mapType = mt.selectedIndex;
	}
	map.setOptions(newOptions);
	Object.assign(mapOptions,newOptions);
	closeDrawer();
}

function notLookingRight() {
	input = escapePoly(input) 
	render(input, true);
}

var pasted
function uploaded(type, el) {
	if (type === 'file') {
		el.nextElementSibling.querySelector('span:last-of-type').innerText = el.value.split(String.fromCharCode(92)).pop()
		el.nextElementSibling.querySelector('span:first-of-type').classList.add('uploaded');
		goToStep(1.5);
	}
	if (type === 'text') {
		el.oninput = null;
	}
	if(type === 'paste') {
		setTimeout(()=> {goToStep(1.5)}, 100);
	}
	document.querySelector('.step.active .next').classList.remove('hidden');
}

var input;
function goToStep(num) {
	var currentStep = document.querySelector('.step.active');

	//preview step 1
	console.log('yes');
	
	if (num === 1.5) {
		if (document.getElementById('polyline-file').files.length !== 0) {
			var reader = new FileReader();
			reader.onload = () =>{
				input = unescapePoly(reader.result);
				render(input, true)
			};
			reader.readAsText(document.getElementById('polyline-file').files[0]);
		} else if (document.getElementById('polyline-text').value.length > 0) {
			input = unescapePoly(document.getElementById('polyline-text').value);
			render(input, true);
		} else {
			console.log('uhhh');
			return;
		}
		console.log(currentStep);

		Object.assign(currentStep.querySelector('.next').firstElementChild, {
			innerText: 'Next',
			onclick: () => {goToStep(2)}
		});
	}

	if (!Number.isInteger(num)) return;
	currentStep.classList.add('complete');
	currentStep.classList.remove('active');
	document.querySelector(`li.step[data-step="${num}"]`).classList.add('active')

	if (num === 2) {
		render(input)
		path.setOptions({editable: true});
		fitPathInViewport();
	}
	if (num === 3) {
		path.setOptions({editable: false});
		shapeBounds = [];
		if (shape) shape.setMap(null);
		if (hoverPoly) hoverPoly.setMap(null);
		if (preview) preview.remove();
		fitPathInViewport();
	}
}

function closeDrawer() {
	document.querySelectorAll('.footer, .drawer div, .handle a').forEach(div => {
		div.classList.remove('open');
	})
}

function showExportMessage(msg) {
	var d = document.querySelector('.download .message')
}

function capitalizeFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function writeToClipboard(text) {
	document.querySelector('.download ~ .message').innerText = 'Copied to clipboard!';
	// navigator.clipboard.writeText(text);
}

function writeToFile(text, fileName) {
	var d = Object.assign(document.createElement('a'), {
		className: 'export-hidden',
		href: `data:text/plain;charset=utf-8,${text}`,
		download: fileName
	});
	document.body.appendChild(d);
	d.click();
	document.body.removeChild(d);
	document.querySelector('.download ~ .message').innerText = fileName + ' is downloading now.';
}

function updateMediums(types) {
	document.querySelector('.download ~ .message').innerText = '';
	document.querySelectorAll('#export-medium option').forEach(o => {
		o.disabled = false;
	});
	document.getElementById(`nl`).classList.remove('hidden');
	document.getElementById(`option_clipboard`).selected = true
	if (types.options[types.selectedIndex].value === 'polyline') {
		document.getElementById(`nl`).classList.add('hidden');
		document.getElementById(`option_csv`).disabled = true;
		document.getElementById(`option_arr`).disabled = true;
		document.getElementById(`option_obj`).disabled = true;
	} else {
		document.getElementById(`option_txt`).disabled = true;
	}
	updateNL(document.getElementById('export-medium'));
}

function updateNL(medium) {
	document.querySelector('.download ~ .message').innerText = '';
	var m = medium.options[medium.selectedIndex];
	if (m.value === 'clipboard' || m.value === 'csv') {
		document.getElementById('new_lines').checked = true;
		document.getElementById('new_lines').disabled = true;
	} else {
		if (m.disabled) medium.selectedIndex
		document.getElementById('new_lines').disabled = false;
	}
}

function exportPath() {
	var type = document.getElementById('export-type').value;
	var medium = document.getElementById('export-medium');
	var hidden = document.querySelector('.clipboard-hidden');
	if (type === 'polyline') {
		if (medium.value === 'clipboard') writeToClipboard(getPolylineFromPath())
		if (medium.value === 'txt') writeToFile(getPolylineFromPath(), 'polyline.txt');
	}
	if (type === 'cords') {
		var nl = document.getElementById('new_lines').checked;
		if (medium.value === 'clipboard') writeToClipboard(printable(getCordsFromPath(path),'arr', nl));
		if (medium.value === 'csv') writeToFile(csv(getCordsFromPath(path)), 'polyline.csv');
		if (medium.value === 'arr') writeToFile(printable(getCordsFromPath(path),'arr', nl), 'polyline_array.js');
		if (medium.value === 'obj') writeToFile(printable(getCordsFromPath(path),'obj', nl), 'polyline_object.js');
		updateNL(medium);
	}
	
}