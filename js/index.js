document.getElementById('clearHistory').addEventListener('click', function() {
	chrome.storage.local.set({"copyArr": []});
	document.getElementById("wrapper").innerHTML = "";
})

document.getElementById('changeEntries').addEventListener('click', function() {
	let maxEntries = prompt("How many entries should be saved? \n(max. 100)", document.getElementById('changeEntries').textContent);

	if ((!isNaN(maxEntries)) && (maxEntries <= 100)) {
		chrome.runtime.sendMessage({message: "set maxEntries", maxEntries: Number(maxEntries)});
		document.getElementById('changeEntries').textContent = maxEntries;
	}
})

function renderForm() {
	document.getElementById("wrapper").innerHTML = "";
	chrome.storage.local.get('copyArr', function(element) {
	 	for(let i = 1; i < element.copyArr.length; i++) {
	 		let div = document.createElement('div');
	 		let date = document.createElement('span');
	 		date.classList.add("date");
			let span = document.createElement('span');
			span.classList.add("entry");
			let hr = document.createElement('hr');
			let btnDel = document.createElement('button');
			btnDel.innerHTML = "<i class='icon-trash'></i>";
			let btnCop = document.createElement('button');
			btnCop.innerHTML = "<i class='icon-docs'></i>";
			btnDel.classList.add("icon");
			btnCop.classList.add("icon");

			let text = element.copyArr[i].text;
			let dateDiff = (new Date()).getTime() - element.copyArr[i].date;
			let dateText = getDateText(dateDiff);

			span.textContent = text;
			date.textContent = dateText;

			btnDel.addEventListener('click', function(event) {
				deleteElement(i);
			})
			btnCop.addEventListener('click', function(event) {
				copyElement(i);
			})

			div.appendChild(date);
			div.appendChild(span);
			div.appendChild(btnCop);
			div.appendChild(btnDel);
			div.appendChild(hr);
			document.getElementById("wrapper").appendChild(div);
	 	}
	})
}

function getDateText(dateDiff) {
	let weeks = (((((dateDiff / 1000) / 60) / 60) / 24 ) / 7);
	console.log(dateDiff);
	if(weeks >= 1) {
		weeks = Math.floor(weeks);
		if(weeks === 1) { return `1 week` }
		return `${weeks} weeks`
	}
	let days = weeks * 7;
	if(days >= 1) {
		days = Math.floor(days);
		if(days === 1) { return `1 day` }
		return `${days} days`
	}
	let hours = days * 24;
	if(hours >= 1) {
		hours = Math.floor(hours);
		if(hours === 1) { return `1 hour` }
		return `${hours} hours`
	}
	let mins = hours * 60;
	if(mins >= 1) {
		mins = Math.floor(mins);
		if(mins === 1) { return `1 minute` }
		return `${mins} minutes`
	}
	let secs = Math.floor(mins * 60);
	if(secs < 10) {
		return 'a few sec'
	}
	return `${secs} secs`
}

function deleteElement(i) {
	chrome.storage.local.get('copyArr', function(element) {
		let newArr = element.copyArr;
		newArr.splice(i, 1)
		chrome.storage.local.set({'copyArr': newArr}, renderForm)
	})
}

function copyElement(i) {
	chrome.storage.local.get('copyArr', function(element) {
		let newArr = element.copyArr;
		let text = newArr.splice(i, 1)[0].text
		newArr[0] = {text: text, date: (new Date()).getTime()};
		newArr.unshift({text: "", date: (new Date()).getTime()});
		chrome.storage.local.set({'copyArr': newArr}, function() {
			renderForm();
			let tmp = document.createElement("input");
			document.getElementById("wrapperTmp").appendChild(tmp);
			tmp.value = text;
			tmp.select();
			document.execCommand("copy");
			document.getElementById("wrapperTmp").innerHTML = "";
		})
	})
}

renderForm();

chrome.runtime.sendMessage({message: "get maxEntries"});
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message === "set maxEntries") {
			document.getElementById('changeEntries').textContent = request.maxEntries;
		}
	})