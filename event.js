import {allWindows,UNKNOWN_PATH,makeItem} from "./board.js"; 
let dragStarter;

function handleItemClicked(ev){
    let id = Number(ev.currentTarget.parentNode.id);
    chrome.windows.update(id,{focused:true});
}

function handleItemHover(ev){
    let type = ev.type;
    let btns = ev.currentTarget.childNodes[0];
    let overlay = ev.currentTarget.childNodes[1];
    if (type == 'mouseover'){   
        overlay.style.opacity = 1;
        overlay.classList.add("darker");
        btns.style.opacity = 1;
    }
    else{
        overlay.style.opacity = 0;
        overlay.classList.remove("darker");
        btns.style.opacity = 0;
    }
        
}

function handleWindowEvent(){
    chrome.windows.onCreated.addListener(({id})=>{
        chrome.windows.get(id,{populate:true},({tabs})=>{
            makeItem(id,tabs);
            addWindow2AllWindows(id,tabs);
            console.log("window created");
        })        
    });
    chrome.windows.onRemoved.addListener(windowId=>{
        document.getElementById(String(windowId)).parentNode.remove();
        console.log("window removed");
    });
}

function handleTabEvent(){
    chrome.tabs.onCreated.addListener((tab)=>{
        if (tab.windowId in allWindows){
            let bodyDiv = document.getElementById(tab.windowId).childNodes[3];
            let img = document.createElement('img');
            let selectedWindowsTabs = allWindows[String(tab.windowId)].tabs;

            img.id = String(tab.id)+'t'
            img.className = 'favImg';
            if (!tab.favIconUrl)
                tab.favIconUrl = UNKNOWN_PATH;
            img.src = tab.favIconUrl;
            img.alt = tab.title;

            if (tab.index !== selectedWindowsTabs.length-1){
                bodyDiv.insertBefore(img,bodyDiv.childNodes[tab.index-1]);
            } else{
                bodyDiv.appendChild(img);
            }

            selectedWindowsTabs.splice(tab.index,0,tab);
            console.log(allWindows[String(tab.windowId)])
        }
    })
    chrome.tabs.onRemoved.addListener((tabId,{isWindowClosing,windowId})=>{
        console.log('whjat');
        if(!isWindowClosing){
            let tabImg = document.getElementById(String(tabId)+'t');
            windowId = String(windowId);

            tabImg.remove()
            allWindows[windowId].tabs.find((tab,index)=>{
                if (tab.id === tabId){
                    console.log("find");
                    return allWindows[windowId].tabs.splice(index,1);
                }
            });
            // console.log(allWindows[windowId]);
        }
    });
    chrome.tabs.onAttached.addListener((tabId,attachInfo)=>{
////////////////////////////////////////need work/////////////////////////////////
        console.log("window attached",tabId,attachInfo);
    })
    chrome.tabs.onDetached.addListener((tabId,detachInfo)=>{ //invoke with each tab
////////////////////////////////////////need work/////////////////////////////////
        console.log("window detached",tabId,detachInfo);
    })
    chrome.tabs.onMoved.addListener((tabId,moveInfo)=>{
////////////////////////////////////////need work/////////////////////////////////
        console.log("window moved\n",tabId,moveInfo,parent)
    });
    chrome.tabs.onUpdated.addListener((tabId,{},tab)=>{
        let statusOfTab = true; let i = 1;
        
        allWindows[tab.windowId].tabs.find((t,index)=>{
            if (t.id === tabId){
                console.log("find"); statusOfTab =false
                if(index == 0) i = 0;                    
                return allWindows[tab.windowId].tabs.splice(index,1,tab);
            }
        }); 
        if(!statusOfTab){ //tab refresh
            let tabDiv = document.getElementById(String(tabId)+'t');
            if(i===0)
                tabDiv.parentNode.childNodes[1].classList.add('loading');
            if(tab.status==="complete"){
                if(!tab.favIconUrl) tab.favIconUrl = UNKNOWN_PATH;
                if(i===0){
                    tabDiv.parentNode.childNodes[1].textContent = tab.title;
                    tabDiv.parentNode.childNodes[1].classList.remove('loading');
                }

                tabDiv.classList.remove('loading');
                tabDiv.src = tab.favIconUrl;
            } else {
                tabDiv.src = UNKNOWN_PATH;
                tabDiv.classList.add('loading');
            }
        }
            
    });
}

function handleBtnClicked(ev){
    let num = Number(ev.target.id);
    let windowId = ev.currentTarget.parentNode.parentNode.id; 
    if (num === 2){ // click save button
        chrome.windows.remove(Number(windowId));
        changeSavedWindows(windowId,num);
        makeItem(windowId+"s",allWindows[Number(windowId)].tabs,false,true);
    } else if (num === 1){ // click close button
        chrome.windows.remove(Number(windowId));
    } else if (num===0){ //click delete button
        changeSavedWindows(windowId,num);
        document.getElementById(windowId).parentNode.remove();
    } else{ //click open button
        getSavedWindow(windowId.slice(0,-1));
        changeSavedWindows(windowId,num);
        document.getElementById(windowId).parentNode.remove();
    ////////////////////////////////////////need work/////////////////////////////////
    }
}

function changeSavedWindows(windowId,mode){ 
    chrome.storage.local.get(['savedWindows'],({savedWindows})=>{
        if (mode === 2){ // mode 2 -> save, -1 & 0 -> delete
            savedWindows.push(allWindows[windowId]);
            deleteWindowFromAllWindows(windowId);
        } else{ //saved windows have letter s with their id
            savedWindows.find((element,index)=>{
                if(element.windowId == Number(windowId.slice(0,-1))){
                    savedWindows.splice(index,1);
                    return deleteWindowFromAllWindows(windowId.slice(0,-1));
                };
            })
        }
        chrome.storage.local.set({savedWindows},()=>{
            console.log(`saved data => `,savedWindows,'\n',allWindows);
        }); 
            
    });
}

function getSavedWindow(windowId){
    let findWindowId = Number(windowId);
    chrome.storage.local.get(['savedWindows'],({savedWindows})=>{
        console.log(findWindowId,savedWindows);
        savedWindows.find((savedInfo)=>{
            if (savedInfo.windowId === findWindowId)
                return openSavedWindow(savedInfo.tabs);
        })
    });
    function openSavedWindow(tabs){
        let tabUrlList = [];
        tabs.forEach(({url})=>{
            tabUrlList.push(url);
        });
        chrome.windows.create({focused:true,url:tabUrlList,left:300});
    }
}

function addWindow2AllWindows(id,tabs){
    allWindows[String(id)] = {
        windowId:id,
        tabs
    }
}
function deleteWindowFromAllWindows(key){
    delete allWindows[key];
}

function dragStrat(ev){
    this.parentNode.classList.add('hold');
    this.childNodes[0].style.opacity = 0 // btns
    this.childNodes[1].classList.remove('darker');
    this.childNodes[1].style.opacity = 0//overlay
    setTimeout(()=>{
        this.classList.add('invisible')
    },0)
    dragStarter = this;
}
function dragEnd(){
    this.classList.remove('invisible')
    this.parentNode.classList.remove('hold');
}
function dragOver(ev){
    ev.preventDefault();
}
function dragEnter(ev){
    ev.preventDefault();
    this.classList.add('over');
}
function dragLeave(){
    this.classList.remove('over');
}
function drop(){
    try{
        this.classList.remove('over');
        let destinationWindowId = Number(this.childNodes[0].id);
        let currentWindowId = dragStarter.id;
        let tabs = allWindows[currentWindowId].tabs;
        let tabsIdList=[];
        tabs.forEach(({id})=>{
            tabsIdList.push(id);
        });
        //this.childNodes[0] -> destination itmeDiv
        
        chrome.tabs.move(tabsIdList,{index:-1,windowId:destinationWindowId},(movedTabs)=>{
            let headerDiv = dragStarter.childNodes[2];
            let bodyDiv = dragStarter.childNodes[3].childNodes;
            this.childNodes[0].childNodes[3].appendChild(headerDiv.childNodes[0]);
            if (bodyDiv){
                bodyDiv.forEach((tabDiv)=>{
                    this.childNodes[0].childNodes[3].appendChild(tabDiv);
                });
            }

            deleteWindowFromAllWindows(currentWindowId);
            dragStarter="";
            chrome.windows.update(destinationWindowId,{focused:true})
            if(Array.isArray(movedTabs)){
                chrome.tabs.update(movedTabs[0].id,{active:true});
                movedTabs.forEach((element)=>{
                    allWindows[String(destinationWindowId)].tabs.push(element);    
                });
            } else{
                chrome.tabs.update(movedTabs.id,{active:true});
                allWindows[String(destinationWindowId)].tabs.push(movedTabs);
            }
            console.log(allWindows);
            // chrome.tabs.query(movedTabs{active:true})
        })
    }catch{

    }
    
} //normal만 drop되게 하기

export {
    handleItemClicked, 
    handleItemHover, 
    handleBtnClicked, 
    handleWindowEvent, 
    handleTabEvent, 
    allWindows, 
    dragEnd, 
    dragStrat,
    dragOver,
    dragEnter,
    dragLeave,
    drop,
};
