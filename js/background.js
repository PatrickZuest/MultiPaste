let i = -1;
let currentClipboard;
let maxEntries = 30;

chrome.commands.onCommand.addListener(function(command) {
	if(command == "pastePlus" || command == "pastePlus1") {
		paste(function(element) { return (++i < element.copyArr.length) }, function() { i-- });
	}
	if(command == "pasteMinus") {
		paste(function() { return (--i > -1) }, function() { i++ });
	}
});

function paste(condition, react) {
	chrome.tabs.query({active: true}, function(tabs) {
		let pasteVal;
		chrome.storage.local.get('copyArr', function(element) {
			if(condition(element)) {
				pasteVal = element.copyArr[i];
				previewObjects = element.copyArr.slice(i + 1, i + 4);
				chrome.tabs.sendMessage(tabs[0].id, {message: "paste", value: pasteVal, previewObjects: previewObjects});
			} else{
				react();
			}
		})		
	})
}

function copyToClipboard(newVal) {
	chrome.storage.local.get('copyArr', function (arr) {
		let newArr = arr.copyArr;
		let date = (new Date()).getTime();
	    newArr[0] = {text: newVal, date: date};
	    newArr.unshift({text: "", date: date});
	    while(newArr.length > (maxEntries + 1)) { newArr.pop(); }
	    chrome.storage.local.set({'copyArr': newArr})
	})
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if(request.message === "insertMode over") {
  		i = -1;
  	}
  	if(request.message === "get maxEntries") {
  		console.log("request received");
  		chrome.runtime.sendMessage({message: "set maxEntries", maxEntries: maxEntries});	
  	}
  	if(request.message === "set maxEntries") {
  		console.log("set request received");
  		maxEntries = request.maxEntries;
  	}
  }
);

chrome.storage.local.set({"copyArr": []});

setInterval(function() {
	document.getElementById("textPaste").select();
	document.getElementById("textPaste").value = "", document.execCommand("paste");
	let newVal = document.getElementById("textPaste").value;
	if((newVal !== currentClipboard) && newVal) {
		copyToClipboard(newVal);
		currentClipboard = newVal;
	}
},300);
