import {createFolder} from "./folder.js";
import {getBoard} from "./board.js";

function getWindows(){
  chrome.windows.getAll({populate:true}, (windows)=>{
    windows.forEach(window=> {
      createFolder(window.id);
    });
  })
}

function addWindowEventListener(){
  chrome.windows.onCreated.addListener(function(window){
    handleOpen(window.id);
  });

  chrome.windows.onRemoved.addListener(function(windowId){
    handleClose(windowId);
  })
}

function handleOpen(windowId){
  createFolder(windowId);
}
function handleClose(windowId){
  document.getElementById(windowId).remove();
}

function init(){
  getWindows();
  getBoard();
  addWindowEventListener();
}

init();



// chrome.tabs.query({},(tab)=>{
//   tab.forEach(element => {
//     [element.favIconUrl,element.url];
//     console.log(element.url);
//   });
// })
// chrome.tabs.captureVisibleTab((dataURL)=>{
//   // console.log(dataURL);
//   thumbNail.children[0].src = dataURL;
// })