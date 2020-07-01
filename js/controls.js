// document.getElementById('input-text').value = 'gdneFdyfjVUW@c@Ci@e@kBUeBMwAYoKGgBMmBUgIOc@e@Gg@ByBLqBDmDP_Ll@sCHk@DgPp@oBJeARuB@uCLc@K_@]cFkH_BsBa@c@_CaDeC{CyKsOeBuB]g@S]uEeGiBkCy@eAIQWWcFcH{A{Bw@_AcDkEcBcC_DeEkCsDqD_F][e@Wa@[k@oAmAoBY_@a@[QQ_@Aa@@oBXi@Ca@BoAPy@TaC\\cAHq@XiCTa@DYJ_@F[KKSENq@Lo@DgBb@aAP{@FeC\\aBXu@Hu@NwBTwAVa@?c@Na@`@qB`DMJKCGFK\\Ud@W`@WV]@m@LQ?uAVk@F';
// function notLookingRight() {
// 	input = escapePoly(input) 
// 	render(input, true);
// }

function changeNextButton(step, text = null, nextStep = null, hide = false) {
	var btn = document.querySelector(`.step[data-step="${step}"] .next`);
	if (text !== null) btn.firstElementChild.innerHTML = `<span>${text}</span>`;
	if (nextStep !== null) btn.firstElementChild.onclick = () => goToStep(nextStep);
	if (hide) btn.classList.add('hidden');
	if (!hide) btn.classList.remove('hidden')
}

function hideNextButton(step, hide) {
	var btn = document.querySelector(`.step[data-step="${step}"] .next`);
	if (hide) btn.classList.add('hidden');
	if (!hide) btn.classList.remove('hidden');
}

function showStep(stepNumber) {
	var currentStep = document.querySelector('.step.active');
	var nextStep = document.querySelector(`.step[data-step="${stepNumber}"]`);

	currentStep.classList.add('complete');
	currentStep.classList.remove('active');
	nextStep.classList.add('active');
}

var originalInput;
function goToStep(num, restart = false) {
	var currentStep = parseInt(document.querySelector('.step.active').dataset.step);
	if (num === 1) {
		showStep(1);
		changeNextButton(1, 'Preview', 1.5);
		hideNextButton(1, document.getElementById('input-text').value.length <= 0);

		if (restart) {
			destroyPath();
			resetUploadForm();
		}
		if (pathModified) {
			document.getElementById('input-file').disabled = true;
			document.getElementById('input-text').disabled = true;
			goToStep(1.5);
			return
		}
	}
	// fetch from url
	if (num === 1.25) {

	}
	// show preview of path
	if (num === 1.5) {
		if (document.getElementById('input-text').value.length <= 0) {
			return;
		}

		
		originalInput = document.getElementById('input-text').value.trim();

		// preview here
		var validPreview = previewInput(originalInput, getFileType());
		if (!validPreview) return;

		toast('Generating Preview', 1500);

		// // input = unescapePoly(input);
		// textInputLength = input.length;
		// if (!pathModified) render(input, true);

		changeNextButton(1, 'Next', 2);
		hideNextButton(1, false);
	}

	if (num === 2 && currentStep !== 2) {
		toast('Loading vertices', Math.ceil(path.getPath().length / 250) * 500);
		showStep(2);

		path.setOptions({editable: true});
		toggleListeners(true);
		
		fitPathInViewport();
	}
	if (num === 3 && currentStep !== 3) {
		toast('Saving Changes');
		showStep(3);

		path.setOptions({editable: false});
		destroyEditingTools();
		toggleListeners(false);

		fitPathInViewport();
		
	}
}


function previewInput(oi, type) {
	if (type === null) {
		// show error
		toast('Please choose a file type', 3000);
		grabAttention(document.querySelector('.file-type-selected'))
		return;
	}
	
	if (type === 'polyline') {
		render(escapePoly(oi));
		return true;
	} else ()
	var validPath = false;
	switch (type) {
		case 'csv':
			validPath = getCoordinatesFromCSV(oi);
			// convert to poly
			break;
		case 'gpx':
			validPath = getCoordinatesFromGPX(oi);
			// convert to poly
			break;
		case 'coordinates':
			validPath = getCoordinatesFromCSV(oi);
			break;
		case 'geojson':
			console.log(oi);
			validPath = getCoordinatesFromGeoJSON(oi);
			// convert to cords
			// convert to poly
			break;
		default:
			break;
	}
	console.log(validPath);
	// return false;
	if (!validPath) return false;
	validPath = polyline.encode(validPath);
	render(validPath)
	return true;
}




function resetUploadForm() {
	var fileInput = document.getElementById('input-file');

	fileInput.value = '';
	fileInput.nextElementSibling.querySelector('span:first-of-type').classList.remove('uploaded');
	fileInput.nextElementSibling.querySelector('span:last-of-type').innerText = 'Upload a text file';
	fileInput.disabled = false;

	var textInput = document.getElementById('input-text');

	textInput.value = '';
	textInput.disabled = false;

	textInputLength = -1;

	changeFileType(null, 'Waiting for input');

	document.querySelectorAll('.step').forEach(s => s.classList.remove('complete'));
	document.querySelector('.reset').classList.add('hidden');

	changeNextButton(1, 'Preview', 1.5);
	hideNextButton(1, true);
	unplug();
}


function grabAttention(el) {
	if (!el) return;
	el.classList.remove('attention')
	el.addEventListener('mouseover', _ => el.classList.remove('attention'), {once:true})
	el.addEventListener('animationend', _ => el.classList.remove('attention'), {once:true})
	setTimeout(_ => el.classList.add('attention'), 100);
}

function resetAll() {
	if (!pathModified || confirm('Are you sure you want to reset?\r\nAll changes will be lost.\r\n')) goToStep(1, true);
}

var plug;
function toast(text, time = -1) {
	var t = document.querySelector('.toaster');
	time = time === -1 ? 999999 : time;
	// start the toast again if it's already on
	if (t.classList.contains('toast')) {
		unplug(true);
		setTimeout(_ => toast(text, time), 201);
		return;
	}
	text = typeof text === 'object' ? text.join(`</div><div>`) : text;
	t.querySelector('.bread div').innerHTML = text;

	t.classList.add('toast');
	plug = setTimeout(unplug, time + 200);
	// 200ms in the time it takes for toast to pop up/down
}

function unplug(replug = false) {
	clearTimeout(plug);
	var t = document.querySelector('.toaster');
	t.classList.remove('toast');
}