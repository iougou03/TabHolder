import * as Events from "./event.js";
import {makeSavedWindowNameDiv} from "./nameing.js";


const UNKNOWN_PATH = "./images/unknown.png";
const currentWindows = document.getElementById('currentWindows');
const savedWindows = document.getElementById('savedWindows');
let allWindows = {}; // allWindows[windowId] = {windowId,tabs}
let savedWindowsNames = {};

async function getWindows(){  

    return await new Promise(resolve=>{
        chrome.windows.getAll({populate:true},(windows)=>{     
            // console.log(windows)
            windows.forEach(({tabs,id})=> {
                allWindows[String(id)] = {
                    windowId:id,
                    tabs:tabs
                }
            });
            resolve("get Windows and saved");
        });
    })
}

async function getSaved(){
    return await new Promise(resolve=>{
        chrome.storage.local.get(['savedWindows'],({savedWindows})=>{
            resolve(savedWindows);
        })
    })
}

async function checkFaviconValid(url) {
    fetch(url).then((result)=> {
        console.log(result)
    })
    .catch((err)=> {
        console.log(err)
    })
}

function makeItem(windowId,tabs,moved= false,saved=false){
    let wrapper;
    let itemDiv = document.createElement('div');
    if (!moved){
        wrapper = document.createElement('div');
        wrapper.className = 'wrapper';
    } else{
        let oldItemDiv = document.getElementById(windowId);
        wrapper = oldItemDiv.parentNode;
        oldItemDiv.remove(); 
    }
    let headerDiv;
    let bodyDiv = document.createElement('div');

    itemDiv.id = windowId;
    itemDiv.className = 'itemDiv';
    bodyDiv.className = 'bodyDiv';
    wrapper.classList.add('show');

    tabs.forEach((tab,index)=>{
        
        if(!tab.favIconUrl)
            tab.favIconUrl = UNKNOWN_PATH;
        if(index == 0)
            headerDiv = makeHeader(tab.id,tab.favIconUrl,tab.title)
        else{
            let img = document.createElement('img');
            img.id = String(tab.id)+'t'
            img.className = 'favImg';
            // if(index > 10)
            //     img.classList.add('hide');
            img.src = tab.favIconUrl;
            // img.alt = tab.title;
            img.alt = " ";
            bodyDiv.appendChild(img);
        }  
    });

    let overlay = document.createElement('div');
    overlay.className = 'overlay';

    itemDiv.addEventListener("mouseover",Events.handleItemHover);
    itemDiv.addEventListener("mouseout",Events.handleItemHover);
    itemDiv.draggable = true;
    if(!saved){
        itemDiv.addEventListener("dragstart",Events.dragStrat);
        itemDiv.addEventListener("dragend",Events.dragEnd)
        wrapper.addEventListener("dragover",Events.dragOver);
        wrapper.addEventListener("dragenter",Events.dragEnter);
        wrapper.addEventListener("dragleave",Events.dragLeave)
        wrapper.addEventListener("drop",Events.drop);
    }

    itemDiv.appendChild(addButtons(saved));
    itemDiv.appendChild(overlay);
    itemDiv.appendChild(headerDiv);
    itemDiv.appendChild(bodyDiv);
    wrapper.appendChild(itemDiv);

    if(!saved){
        overlay.addEventListener("click",Events.handleItemClicked);
        if(!moved)
            currentWindows.appendChild(wrapper);
    }
    else{
        let nameDiv = makeSavedWindowNameDiv(windowId);
        itemDiv.classList.add('savedWindow');
        wrapper.insertBefore(nameDiv,itemDiv);
        savedWindows.appendChild(wrapper);    
    }
}

function makeHeader(id,favIconUrl,title){
    let div = document.createElement('div');
    div.className = 'headerDiv';
    let img = document.createElement('img');
    img.className = 'favImg';
    let span = document.createElement('span');

    img.id=String(id)+'t'
    img.src = favIconUrl;
    // if (title.length > 23){
    //     title = title.slice(0,23)
    //     title = title.slice(0,-1)+'...';
    // }
    span.textContent = title;
    div.appendChild(img);
    div.appendChild(span);
    return div;
}

function addButtons(saved){
    let btnsDiv = document.createElement('div');
    btnsDiv.className = 'btnsDiv';
    if (saved){ //making saved windows
        let openBtn = document.createElement('button');
        let delBtn = document.createElement('button');

        openBtn.id = -1;
        openBtn.textContent = 'open ✅';
        openBtn.addEventListener("click",Events.handleBtnClicked);

        delBtn.id = 0;
        delBtn.textContent = "delete 🗑";
        delBtn.addEventListener("click",Events.handleBtnClicked)

        btnsDiv.appendChild(openBtn);
        btnsDiv.appendChild(delBtn);
    }else{ //making current windows
        let saveBtn = document.createElement('button');
        let closeBtn = document.createElement('button');
        
        saveBtn.id = 2;
        saveBtn.className = 'saveBtn';
        saveBtn.textContent='save ♻';
        closeBtn.id = 1;
        closeBtn.className = 'closeBtn';
        closeBtn.textContent = 'close ❌';
        
        saveBtn.addEventListener("click",Events.handleBtnClicked)
        closeBtn.addEventListener("click",Events.handleBtnClicked)

        btnsDiv.appendChild(saveBtn);
        btnsDiv.appendChild(closeBtn);
    }
    return btnsDiv;
}

function makeBoard(){
    getWindows().then(()=>{
        for(const [windowId,{tabs}] of Object.entries(allWindows))
            makeItem(windowId,tabs);
    });
    getSaved().then(savedWindows=>{
        savedWindows.forEach(({windowId,tabs,name})=>{
            savedWindowsNames[windowId] = name;
            makeItem(String(windowId)+'s',tabs,false,true);
        });
    })
}
function init(){
    makeBoard();
    Events.handleWindowEvent();
    Events.handleTabEvent();
    console.log(allWindows);
}


init();

export {UNKNOWN_PATH,allWindows,makeItem,savedWindowsNames}