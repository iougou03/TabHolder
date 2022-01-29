import TabModel from "./model/TabModel.js";
import WindowModel from "./model/WindowModel.js";
import WindowItem from "./components/window-item.js";

const app = document.getElementById("app")
const globalWindowList = [];
let htmlList = [];
// windowModelMap is used for finding specific window in the list--globalWIndowList--quickly
const windowModelMap = {};

const htmlProxy = new Proxy(htmlList, {
	set: function(target, prop, val, receiv){
		// console.log(target, prop, val, receiv)
		drawItems();
		return Reflect.set(target,prop,val,receiv);
	}
})

function drawItems(){
	let appHtml = '';
	htmlList.forEach(tabList=>{
		appHtml += tabList.join("")
	})
	app.innerHTML = appHtml;
}
function getWindowItem(wm){
	let html = [];

	wm.tabList.forEach((tm, tmIdx) => {
		let imgSrc = typeof(tm.favIconUrl) == "undefined" ? "./images/unknown.png" : tm.favIconUrl

		if (tmIdx === 0) html.push(`
				<div class="header-container" slot="header">
					<li>
						<img src="${imgSrc}">	
					</li>
					<h1>${tm.title}</h1>
				</div>

				<div class="tab-container">
			`);
		else 
			html.push(`
					<li>
						<img src="${imgSrc}">	
					</li>
				`);
  });

	html.push("</div>") // for tab-container
	html.unshift('<div class="item-container" slot="item-container">');
	html.push('</div>'); // for item-container
	html.unshift(`<window-item itemListLength="${wm.tabList.length}">`);
  html.push(`</window-item>`);

	return html;
}

function pushWindowModel(w) {
	globalWindowList.push(new WindowModel(w.focused, w.id, w.top, w.left));
  const last_idx = globalWindowList.length - 1;
  windowModelMap[w.id] = last_idx;

	return new Promise(res=>{
		chrome.tabs.query({ windowId: w.id }, (allTab) => {
			allTab.forEach((tab) => {
				const tm = new TabModel(tab.active, tab.url, tab.title, tab.favIconUrl);
				globalWindowList[last_idx].addTab(tm);
			});	
	
			res(last_idx);
		})
	})
}

function removeWindowModel(windowId) {
  globalWindowList.splice(windowModelMap[windowId], 1);
	htmlProxy.splice(windowModelMap[windowId], 1);
  delete windowModelMap[windowId];
}

// handle events for tabs
function setWindowEvents(){
	chrome.windows.onCreated.addListener(
		(w) => {
			pushWindowModel(w)
				.then(last_idx=>{
					const lastWm = getWindowItem(globalWindowList[last_idx]);
					htmlProxy.push(lastWm);
				});
		},
		{ windowTypes: ["normal"] }
	);
	chrome.windows.onRemoved.addListener(
		(windowId) => {
			removeWindowModel(windowId);
		},
		{ windowTypes: ["normal"] }
	);
}
// handle events for tabs
function setTabEvents(){
	chrome.tabs.onMoved.addListener((tabId, moveInfo)=>{
		console.log(moveInfo.fromIndex, moveInfo.toIndex)


	});
}

// init
(()=>{
	// set initial events
	setWindowEvents();
	setTabEvents();

	// initialize globalWindowList
  chrome.windows.getAll({windowTypes: ["normal"],}, (windows) => {
			windows.forEach(w => {
			pushWindowModel(w)
				.then(last_idx=>{
					const lastWm = getWindowItem(globalWindowList[last_idx]);
					htmlProxy.push(lastWm);
				});
		});
	});

	// initialize web component
	customElements.define("window-item",WindowItem);
})();
