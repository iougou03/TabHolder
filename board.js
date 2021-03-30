import * as Events from "./event.js";

export const UNKNOWN_PATH = "./images/unknown.png";
const board = document.querySelector('.board');
const container1 = document.getElementById('container1');
const container2 = document.getElementById('container2');

function getWindows(){
    let windowList = [];    
    
    let promise = new Promise(resolve=>{
        chrome.windows.getAll({populate:true},(windows)=>{     
            // console.log(windows)
            windows.forEach(({id, tabs})=> {
                windowList.push({windowId:id,tabs});
            });
            resolve(windowList);
        });
    })

    return promise.then();
}

function getSavedWindows(){
    chrome.storage.local.get(['data'],result=>{
        console.log(result);
    })
}

export function makeContainer(windowId,tabs,mode=true){ //if true, make with saved urls
    let first =tabs.shift()
    let tabList = [];

    if (mode){

    } else {
        if (!first.favIconUrl)
            first.favIconUrl = UNKNOWN_PATH;
        first ={
            favIcon:first.favIconUrl,
            url:first.url,
            title:first.title,
            tabId:first.id
        }

        tabs.forEach(tab => {
            if (!tab.favIconUrl)
                tab.favIconUrl = UNKNOWN_PATH;

            tabList.push({
                favIcon:tab.favIconUrl,
                url:tab.url,
                tabId:tab.id
            });
        });
        // console.log(favicons,title,tabList);
    }

    makeItem(windowId,first,tabList);
}

function makeItem(windowId,first,tabList){
    let div = document.createElement('div');
    div.className = 'item';
    div.id = windowId;
    let firstPage = document.createElement('div');
    firstPage.className = 'firstPage';
    let otherPages = document.createElement('div');
    otherPages.className = 'otherPages';
    let overlay = document.createElement('div');
    overlay.className = 'overlay';

    let favImg = document.createElement('img');
    favImg.id = first.tabId;
    favImg.className = 'favImg';
    favImg.alt = first.url;
    let itemTitle = document.createElement('p');
    itemTitle.className = 'itemTitle';

    let btnDiv = document.createElement('div');
    btnDiv.className = 'btnDiv';
    let closeBtn = document.createElement('button');
    closeBtn.id = 0;
    closeBtn.className = 'closeBtn';
    closeBtn.textContent = 'close ❌';
    let saveBtn = document.createElement('button');
    saveBtn.id = 1;
    saveBtn.className = 'saveBtn';
    saveBtn.textContent='save ♻';
    closeBtn.addEventListener("click",Events.handleBtnClick)
    saveBtn.addEventListener("click",Events.handleBtnClick)

    btnDiv.appendChild(saveBtn);
    btnDiv.appendChild(closeBtn);
    div.appendChild(btnDiv);

    favImg.src = first.favIcon;
    firstPage.appendChild(favImg);
    itemTitle.textContent = first.title;
    firstPage.appendChild(itemTitle);

    tabList.forEach(({favIcon,tabId,url})=>{
        let img = document.createElement('img');
        img.className = 'favImg';
        img.src = favIcon;
        img.id = tabId;
        img.alt = url;
        otherPages.appendChild(img);
    });

    div.appendChild(overlay);
    div.appendChild(firstPage);
    div.appendChild(otherPages);

    div.addEventListener("mouseover",Events.handleItemHover);
    div.addEventListener("mouseout",Events.handleItemHover);
    overlay.addEventListener("click",(ev)=>Events.handleItemClicked(ev,windowId))

    container1.appendChild(div);
}

export function appendItem(windowId,tab){
    let parent = document.getElementById(windowId);
    let child = document.createElement('img');
    child.src = tab.favIconUrl;
    child.id = tab.id;
    child.className = 'favImg';
    parent.childNodes[3].appendChild(child);
}

function makeBoard(){
    getWindows().then(windowList=>{
        windowList.forEach(({windowId,tabs})=>{
            makeContainer(windowId,tabs,false);
        })
    });
    // getSavedWindows();
}

function init(){
    makeBoard();
    Events.handleWindowEvent();
    Events.handleTabEvent();
}

init();