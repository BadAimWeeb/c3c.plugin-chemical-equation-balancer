var jsdom = global.nodemodule.jsdom;
var JSDOM = jsdom.JSDOM;

var balancerHTML = new JSDOM(global.fileMap["chemequbal_sourcehtml"].toString(), {
	runScripts: "dangerously"
});
let window = balancerHTML.window;
let document = balancerHTML.window.document;

var mapReplace = function mapReplace(map, str) {
	for (let original in map) {
        str = str.replace(new RegExp(original.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'), "g"), map[original]);
	}
	return str;
}

var subscript = function subscript(nulled, str) {
	let mapping = {
		"0": "₀",
		"1": "₁",
		"2": "₂",
		"3": "₃",
		"4": "₄",
		"5": "₅",
		"6": "₆",
		"7": "₇",
		"8": "₈",
		"9": "₉"
	}
	return mapReplace(mapping, str);
}

var superscript = function superscript(nulled, str) {
	let mapping = {
		"0": "⁰",
		"1": "¹",
		"2": "²",
		"3": "³",
		"4": "⁴",
		"5": "⁵",
		"6": "⁶",
		"7": "⁷",
		"8": "⁸",
		"9": "⁹",
		"+": "⁺",
		"−": "⁻"
	}
	return mapReplace(mapping, str);
}

var balance = function balance(type, data) {
	let inputValue = data.args.slice(1).join(" ");
	
	document.getElementById("inputFormula").value = inputValue;
	document.getElementById("doBalance").click();
	
	let error = document.getElementById("message").innerHTML;
	if (error != "") {
		let errorAtHTML = document.getElementById("codeOutput").innerHTML.trim().replace(/<u>/g, " _").replace(/<\/u>/g, "_ ").trim();
		
		return {
			handler: "internal",
			data: `${error}\n\n${errorAtHTML}`
		}
	}
	
	let resultText = "";
	let nodesList = document.getElementById("balanced").childNodes;
	for (let i in nodesList) {
		switch (nodesList[i].className) {
			case "coefficient":
			case "rightarrow":
			case "plus":
				resultText += nodesList[i].innerHTML;
				break;
			case "term":
				for (let j in nodesList[i].childNodes) {
					switch (nodesList[i].childNodes[j].tagName) {
						case "SPAN":
							switch (nodesList[i].childNodes[j].className) {
								case "element":
									resultText += nodesList[i].childNodes[j].innerHTML.replace(/<sub>(.+?)<\/sub>/g, subscript);
									break;
								case "group":
									for (let k in nodesList[i].childNodes[j].childNodes) {
										switch (nodesList[i].childNodes[j].childNodes[k].nodeType) {
											case 3:
												resultText += nodesList[i].childNodes[j].childNodes[k].wholeText;
												break;
											case 1:
												switch (nodesList[i].childNodes[j].childNodes[k].tagName) {
													case "SPAN":
														resultText += nodesList[i].childNodes[j].childNodes[k].innerHTML.replace(/<sub>(.+?)<\/sub>/g, subscript);
														break;
													case "SUB":
														resultText += subscript(null, nodesList[i].childNodes[j].childNodes[k].innerHTML);
														break;
												}
												break;
										}
									}
									break;
							}
							break;
						case "SUP":
							resultText += superscript(null, nodesList[i].childNodes[j].innerHTML);
							break;
					}
				}
				break;
		}
	}
	
	return {
		handler: "internal",
		data: resultText
	}
}

module.exports = {
	balance,
	onUnload: function () {
		delete document;
		delete window;
		delete balancerHTML;
		delete JSDOM;
		delete jsdom;
	}
}
