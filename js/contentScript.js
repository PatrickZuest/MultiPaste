const PREVIEWCOUNT = 3;

let insertMode = false;
const eventNames = ['keyup', 'focusout', 'click'];
let overlay = document.createElement('div');
let previewSpans = [];
let activeElement, isInput, copyVal, currentVal, previousCount;

function insertModeOver(event) {
	function reset() {
		insertMode = false;
		chrome.runtime.sendMessage({message: "insertMode over"});
		eventNames.forEach(function(eventName){
			activeElement.removeEventListener(eventName, insertModeOver);
		});

		if(!isInput) {
			let tmp = document.createElement("input");
			overlay.appendChild(tmp);
			tmp.value = copyVal;
			tmp.select();
			document.execCommand("copy");
			overlay.removeChild(tmp);
			activeElement.focus();

			previewSpans[0].classList.remove("copyElement");
		}

		document.body.removeChild(overlay);
		overlay.classList.remove("noInput");
	}

	if(event.type === "keyup") {
		if(event.keyCode == 17) {
			reset();
		}
	} else {
		reset();
	}
}

function createOverlay() {
	overlay.classList.add("overlay");
	for(let i = 0; i < PREVIEWCOUNT; i++) {
		let preview = document.createElement('span');
		preview.classList.add("preview");
		previewSpans.push(preview);
		overlay.appendChild(preview);
		if(i !== (PREVIEWCOUNT - 1)) {
			let hr = document.createElement('hr');
			overlay.appendChild(hr);
		}
	}
}

function showOverlay(offset) {

	document.body.appendChild(overlay);

	if(offset) {
		let fontSize = getComputedStyle(activeElement).getPropertyValue('font-size');
		let fontFamily = getComputedStyle(activeElement).getPropertyValue('font-family');
		overlay.style.fontFamily = fontFamily;
		overlay.style.fontSize = fontSize;
		overlay.style.top = parseFloat(fontSize) + offset.top + 5 + 'px';
		overlay.style.left = offset.left + 'px';
		
	} else {
		overlay.classList.add("noInput");
		previewSpans[0].classList.add("copyElement");
	}
}

function updateOverlay(previewObjects) {
	for(let i = 0; i < previewSpans.length; i++) {
		if(previewObjects[i]) {
			previewSpans[i].textContent = previewObjects[i].text;
		} else {
			previewSpans[i].innerHTML = "";
		}
	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {	
		if(request.message == "paste") {
			if(!insertMode) {
				activeElement = document.activeElement;
				insertMode = true;
				let offset;

				try { 
					offset = $(':focus').caret('offset');
					isInput = true; 
				} 
				catch (err) { isInput = false; }

				showOverlay(offset);

				eventNames.forEach(function(eventName){
					activeElement.addEventListener(eventName, insertModeOver);
				});

			} else if(isInput){
				// this needs to be solved differently, I know
				for(let i = 0; i < previousCount; i++) {
					document.execCommand('delete');
				}
			}

			updateOverlay(request.previewObjects);
			currentVal = request.value.text;
			try { copyVal = request.previewObjects[0].text; } 
			catch (err) { copyVal = ""; }

			if(isInput) {
				document.execCommand('insertText', false, currentVal);
				previousCount = currentVal.length;
			}			
		}
	});

createOverlay();