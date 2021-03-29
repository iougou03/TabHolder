import { craeteBoard } from "./board.js";

const folderBox= document.querySelector(".folderBox");

function saveUrl({tabs}){
    let URLs =[];
    chrome.storage.sync.get(["board"],({board})=>{
        tabs.forEach((tab)=>{
            URLs.push(tab.url);
        });
        console.log(URLs,board);
        let index = board.push(URLs) - 1;
        let id = `board ${index}`;
        chrome.storage.sync.set({board:board});
        console.log(board);
        craeteBoard(id,index,URLs);
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
      thumbNail.classList.add("darker");
      btn.style.opacity = 1;
      btn.style.transition = "0.5s";
    });
    thumbNailDiv.addEventListener("mouseout",(event)=>{
      thumbNail.classList.remove("darker");
      btn.style.opacity = 0;
      btn.style.transition = "0.5s";
    });

    thumbNail.draggable = true;
    thumbNail.addEventListener("dragstart",(event)=>{
      btn.style.display='none';
      thumbNail.classList.add('hold');
      setTimeout(()=>{thumbNail.classList.add('invisible')})

      chrome.windows.get(windowId,{populate:true},({tabs})=>{
        let URLs =[];
        tabs.forEach((tab)=>{
          URLs.push(tab.url); 
        });
      });
      event.dataTransfer.setData("text/plain",event.target.parentNode.id);
    });
    thumbNail.addEventListener("dragend",()=>{
      btn.style.display='block';
      thumbNail.classList.remove('hold');
      thumbNail.classList.remove('invisible');
    });
    thumbNail.addEventListener("dragenter",(e)=>{
      e.preventDefault();
      thumbNail.classList.add("darker");
    });
    thumbNail.addEventListener("dragover",(e)=>{
      e.preventDefault();
    })
    thumbNail.addEventListener("dragleave",(e)=>{
      thumbNail.classList.remove("darker");
    });
    thumbNail.addEventListener("drop",(event)=>{
      let id = Number(event.target.parentNode.id);
      let preId = Number(event.dataTransfer.getData("text"));
      chrome.windows.update(id,{focused:true});
      chrome.windows.get(preId,{populate:true},({tabs})=>{
        tabs.forEach((tab)=>{
          chrome.tabs.move(tab.id,{index:-1,windowId:id});
        })
        chrome.tabs.update(tabs[tabs.length-1].id,{active:true});
      });
      
    });

    thumbNail.addEventListener("click",function(event){
      chrome.windows.update(windowId,{focused:true});
    })
    btn.addEventListener("click",function(){handleCloseButton(windowId,thumbNailDiv)});
    
    updateThumbnail(windowId,thumbNail);
    thumbNailDiv.appendChild(btn);
    thumbNailDiv.appendChild(thumbNail);
    folderBox.appendChild (thumbNailDiv);
}

function updateThumbnail(windowId,thumbNail){
  chrome.tabs.captureVisibleTab(windowId,(dataURL)=>{
    thumbNail.alt = "URL image";
    if (dataURL){
      thumbNail.src = dataURL;
    } else{
      thumbNail.src = "https://www.dgateclassifieds.co.zw/wp-content/uploads/2020/11/no-image.png";
      }
  });
}

function handleCloseButton(windowId,thumbNailDiv){
    let alertDivBack = document.createElement('div');
    alertDivBack.id = "alertDivBack";

    let alertDiv = document.createElement('div');
    alertDiv.className=  "alertDiv";
    let text = document.createElement('span');
    text.textContent = "Want to save or not";
    let btnSave = document.createElement('button'), btnDel = document.createElement('button');
    btnSave.textContent = 'save';
    btnDel.textContent = 'Del';
    btnSave.addEventListener("click",function(){saveUrlButton(windowId,alertDivBack)}); 
    btnDel.addEventListener("click",()=>{delUrlButton(windowId,alertDivBack)});
    alertDivBack.addEventListener("click",()=>{
      alertDivBack.remove();
    })
    alertDiv.appendChild(text);
    alertDiv.appendChild(btnSave);
    alertDiv.appendChild(btnDel);
    alertDivBack.appendChild(alertDiv)
    document.body.before(alertDivBack);
}

function saveUrlButton(windowId,alertDivBack){
  chrome.windows.get(windowId,{populate:true},(window)=>{
    saveUrl(window);
  })
  chrome.windows.remove(windowId);
  alertDivBack.remove();
}
function delUrlButton(windowId,alertDivBack){
  chrome.windows.remove(windowId,()=>{});
  alertDivBack.remove();
}

export {createFolder,updateThumbnail};