import { craeteBoard } from "./board.js";

const folderBox= document.getElementById("folderBox");

function saveUrl({tabs}){
    let URLs =[];
    chrome.storage.sync.get(["board"],({board})=>{
        tabs.forEach((tab)=>{
            URLs.push(tab.url);
        });
        console.log(URLs);
        board.push(URLs);
        let index = board.length - 1;
        let i = `board ${index}`;
        chrome.storage.sync.set({
            board:[board]
        });
        craeteBoard(i);
    });
}

function createFolder(windowId){
    let thumbNailDiv = document.createElement('div');
    thumbNailDiv.className="thumbNail"; 
    thumbNailDiv.id = windowId;
    let btn = document.createElement('button');
    btn.className="thumbNailClose";
    btn.textContent = 'x';
    
    let thumbNail = document.createElement('img');
    thumbNail.className="tab";
  
    thumbNailDiv.addEventListener("mouseover",(event)=>{
      thumbNail.style.transition = "0.5s";
      thumbNail.style.filter = "brightness(50%)";
  
      btn.style.opacity = 1;
      btn.style.transition = "0.5s";
    });
    thumbNailDiv.addEventListener("mouseout",(event)=>{
      thumbNail.style.transition = "0.5s";
      thumbNail.style.filter = "brightness(100%)";
  
      btn.style.opacity = 0;
      btn.style.transition = "0.5s";
    });
    thumbNailDiv.addEventListener("click",function(event){
      chrome.windows.update(windowId,{focused:true});
    })
  
    btn.addEventListener("click",function(){handleCloseButton(windowId)});
  
    chrome.tabs.captureVisibleTab(windowId,(dataURL)=>{
      thumbNail.alt = "URL image";
      if (dataURL){
        thumbNail.src = dataURL;
      } else{
        thumbNail.src = "https://www.dgateclassifieds.co.zw/wp-content/uploads/2020/11/no-image.png";
        }
    });
  
    thumbNailDiv.appendChild(btn);
    thumbNailDiv.appendChild(thumbNail);
    
    folderBox.appendChild (thumbNailDiv);
  }
  
function handleCloseButton(windowId){
    chrome.windows.get(windowId,{populate:true},(window)=>{
        saveUrl(window);
    })
    chrome.windows.remove(windowId);
}


export {createFolder};