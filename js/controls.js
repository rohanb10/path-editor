// document.getElementById('polyline-text').value = 'gdneFdyfjVUW@c@Ci@e@kBUeBMwAYoKGgBMmBUgIOc@e@Gg@ByBLqBDmDP_Ll@sCHk@DgPp@oBJeARuB@uCLc@K_@]cFkH_BsBa@c@_CaDeC{CyKsOeBuB]g@S]uEeGiBkCy@eAIQWWcFcH{A{Bw@_AcDkEcBcC_DeEkCsDqD_F][e@Wa@[k@oAmAoBY_@a@[QQ_@Aa@@oBXi@Ca@BoAPy@TaC\\cAHq@XiCTa@DYJ_@F[KKSENq@Lo@DgBb@aAP{@FeC\\aBXu@Hu@NwBTwAVa@?c@Na@`@qB`DMJKCGFK\\Ud@W`@WV]@m@LQ?uAVk@F';
// function notLookingRight() {
// 	input = escapePoly(input) 
// 	render(input, true);
// }
function resetUploadForm() {
	console.log('why');
	var fileInput = document.getElementById('polyline-file');

	fileInput.value = '';
	fileInput.nextElementSibling.querySelector('span:first-of-type').classList.remove('uploaded');
	fileInput.nextElementSibling.querySelector('span:last-of-type').innerText = 'Upload a text file';
	fileInput.disabled = false;

	var textInput = document.getElementById('polyline-text');

	textInput.value = '';
	textInput.disabled = false;
	// textInput.onpaste = () => uploaded('paste', this);

	textInputLength = -1;

	document.querySelectorAll('.step').forEach(s => s.classList.remove('complete'));

	hideNextButton(1, true);
}


var textInputLength = -1;
function uploaded(type, el) {
	switch (type) {
		case 'file':
			el.nextElementSibling.querySelector('span:last-of-type').innerText = el.value.split(String.fromCharCode(92)).pop()
			el.nextElementSibling.querySelector('span:first-of-type').classList.add('uploaded');
			goToStep(1.5, false);
			break;
		case 'paste':
			document.getElementById('polyline-file').disabled = true;
			setTimeout(() => goToStep(1.5), 100);
			break;
		case 'text':
			if (el.value.length > 0) {
				document.getElementById('polyline-file').disabled = true;
				// el.onpaste = null;
				if (el.value.length !== textInputLength){
					goToStep(1, textInputLength.length <= 0)
				}
				hideNextButton(1, false);
				return;
			}
			console.log('hi');
			resetUploadForm();
			break;
		default:
			break;
	}
	// HELLOOOO
	// changeNextButton(1, null, null, false)
	document.querySelector('.reset').classList.remove('hidden');
}

function resetAll() {
	console.log('hi');
	if (confirm('Are you sure you want to reset?\r\nAll changes will be lost.\r\n')) goToStep(1, true);
}

function hideNextButton(step, hide) {
	var btn = document.querySelector(`.step[data-step="${step}"] .next`);
	if (hide) btn.classList.add('hidden');
	if (!hide) btn.classList.remove('hidden');
}

function changeNextButton(step, text = null, nextStep = null, hide = false) {
	var btn = document.querySelector(`.step[data-step="${step}"] .next`);
	if (text !== null) btn.firstElementChild.innerHTML = `<span>${text}</span>`;
	if (nextStep !== null) btn.firstElementChild.onclick = () => goToStep(nextStep);
	if (hide) btn.classList.add('hidden');
	if (!hide) btn.classList.remove('hidden')
}

function showStep(stepNumber) {
	var currentStep = document.querySelector('.step.active');
	var nextStep = document.querySelector(`.step[data-step="${stepNumber}"]`);

	currentStep.classList.add('complete');
	currentStep.classList.remove('active');
	nextStep.classList.add('active');
}

var input;
function goToStep(num, restart = false) {
	var currentStep = parseInt(document.querySelector('.step.active').dataset.step);
	console.log(currentStep, num);
	if (num === 1) {
		showStep(1);
		changeNextButton(1, 'Preview', 1.5);
		if (restart) {
			destroyPath();
			resetUploadForm();
		}
		if (pathModified) {
			document.getElementById('polyline-file').disabled = true;
			document.getElementById('polyline-text').disabled = true;
			goToStep(1.5);
			return
		}
		// if (textInput.value.length > 0 && nextButton) {
		// 	nextButton.classList.remove('hidden');
		// }
	}
	
	if (num === 1.5) {
		if (document.getElementById('polyline-file').value.length > 0) {
			toast('Generating Preview');
			var reader = new FileReader();
			reader.onload = () => {

				input = unescapePoly(reader.result);
				Object.assign(document.getElementById('polyline-text'), {disabled: true, value: input});
				if (!pathModified) render(input, true);
			};
			reader.readAsText(document.getElementById('polyline-file').files[0]);
		} else if (document.getElementById('polyline-text').value.length > 0) {
			toast('Generating Preview');
			var input = document.getElementById('polyline-text').value.trim();
			input = unescapePoly(input);
			textInputLength = input.length;
			if (!pathModified) render(input, true);
		}
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

function toast(text, time = 1000) {
	var t = document.querySelector('.toaster');
	t.firstElementChild.innerHTML = text;
	t.classList.add('toast');
	setTimeout(() => t.classList.remove('toast'), time + 501);

}