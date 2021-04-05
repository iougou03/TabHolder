import {allWindows,UNKNOWN_PATH,makeItem,savedWindowsNames} from "./board.js"; 

const DO_NOT_ACTIVE_MOVE = false
const ACTIVE_MOVE = true
let dragStarter;

function handleItemClicked(ev){
    let id = Number(ev.currentTarget.parentNode.id);
    chrome.windows.update(id,{focused:true});
}

function handleItemHover(ev){
    let type = ev.type;
    let btns = ev.currentTarget.childNodes[0];
    let overlay = ev.currentTarget.childNodes[1];
    let nameDiv = ev.currentTarget.parentNode.childNodes[0];

    if (type == 'mouseover'){   
        overlay.style.opacity = 1;
        overlay.classList.add("darker");
        btns.style.opacity = 1;
        nameDiv.style.transform = 'scale(1.025)';
        nameDiv.style.transition= '0.1s ease-in';
    }
    else{
        overlay.style.opacity = 0;
        overlay.classList.remove("darker");
        btns.style.opacity = 0;
        nameDiv.style.transform = 'scale(1)';
    }
        
}

function handleWindowEvent(){
    chrome.windows.onCreated.addListener(({id})=>{
        chrome.windows.get(id,{populate:true},({tabs})=>{
            makeItem(id,tabs);
            addWindow2AllWindows(id,tabs);
            console.log("window created\n",allWindows);
        })        
    });
    chrome.windows.onRemoved.addListener(windowId=>{
        let wrapper =document.getElementById(String(windowId)).parentNode;
        wrapper.classList.remove('show');
        wrapper.classList.add('hide');
        setInterval(()=>{
            wrapper.remove();
        },200);
        deleteWindowFromAllWindows(windowId);
        console.log("window removed",allWindows);
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
        if(!isWindowClosing){
            let tabImg = document.getElementById(String(tabId)+'t');
            let itemDiv =tabImg.parentNode.parentNode
            windowId = String(windowId);

            console.log(itemDiv)
            allWindows[windowId].tabs.find((tab,index)=>{
                if (tab.id === tabId){
                    console.log("find");
                    return allWindows[windowId].tabs.splice(index,1);
                }
            });
            makeItem(windowId,allWindows[windowId].tabs,true)
        }
    });

    let attachStatus = ACTIVE_MOVE
    
    chrome.tabs.onAttached.addListener((tabId,{newPosition,newWindowId})=>{
        console.log("tab attached",tabId,newPosition);
        if(newWindowId in allWindows){
            attachStatus = DO_NOT_ACTIVE_MOVE;
            chrome.tabs.get(tabId,(tab)=>{
                console.log(newWindowId,tab.index);
                allWindows[newWindowId].tabs.splice(tab.index,0,tab);
                makeItem(newWindowId,allWindows[newWindowId].tabs,true);
                attachStatus = ACTIVE_MOVE;
            })
        } else{ //window created or go attach at index 0
            attachStatus = ACTIVE_MOVE;
        }
    })
    chrome.tabs.onDetached.addListener((tabId,{oldPosition,oldWindowId})=>{ //invoke with each tab
        console.log("tab detached",tabId);

        let tabs = allWindows[oldWindowId].tabs;
        tabs.splice(oldPosition,1); 
        
        if(tabs.length !== 0){
            if(oldPosition===0)
                makeItem(oldWindowId,tabs,true);
            else
                document.getElementById(tabId+'t').remove();
        }
    })

    chrome.tabs.onMoved.addListener((tabId,moveInfo)=>{
        console.log('moved',moveInfo.fromIndex,moveInfo.toIndex);
        let fromIndex = moveInfo.fromIndex;
        let toIndex = moveInfo.toIndex;
        let gap = toIndex - fromIndex;
        if(attachStatus){
            let arr = allWindows[moveInfo.windowId].tabs
            if (arr){
                [arr[fromIndex],arr[toIndex]] = [arr[toIndex],arr[fromIndex]];
                makeItem(String(moveInfo.windowId),arr,true,false);
            }
        }else if(gap > 1)
            attachStatus = DO_NOT_ACTIVE_MOVE;
        else
            attachStatus = ACTIVE_MOVE;
        
    });
    chrome.tabs.onUpdated.addListener((tabId,{},tab)=>{
        let statusOfTab = true; let i = 1;
        
        allWindows[tab.windowId].tabs.find((t,index)=>{
            if (t.id === tabId){
                statusOfTab =false
                if(index == 0) i = 0;                    
                return allWindows[tab.windowId].tabs.splice(index,1,tab);
            }
        }); 
        if(!statusOfTab){ //tab refresh
            let tabDiv = document.getElementById(String(tabId)+'t');
            if(i===0)
                tabDiv.parentNode.childNodes[1].style.color = "red";
            if(tab.status==="complete"){
                if(!tab.favIconUrl) tab.favIconUrl = UNKNOWN_PATH;
                if(i===0){
                    // headerDiv span
                    tabDiv.parentNode.childNodes[1].textContent = tab.title;
                    tabDiv.parentNode.childNodes[1].style.color ='#50586C';
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
        savedWindowsNames[windowId] = 'name';
        chrome.windows.remove(Number(windowId));
        changeSavedWindows(windowId,num);
        makeItem(windowId+"s",allWindows[Number(windowId)].tabs,false,true);
    } else if (num === 1){ // click close button
        chrome.windows.remove(Number(windowId));
        deleteWindowFromAllWindows(windowId);
    }else{ //click open button (-1) or click delete button (0)
        document.getElementById(windowId).parentNode.remove();
        windowId = Number(windowId.slice(0,-1));
        changeSavedWindows(windowId,num);
    }
}

function changeSavedWindows(windowId,mode){ 
    chrome.storage.local.get(['savedWindows'],({savedWindows})=>{
        if (mode === 2){ // mode 2 -> save, -1 ->open, 0 -> delete
            allWindows[windowId].name = 'name';
            savedWindows.push(allWindows[windowId]);
            deleteWindowFromAllWindows(windowId);
        } else{ //saved windows have letter s with their id
            savedWindows.find((element,index)=>{
                if(element.windowId === windowId){
                    if(mode === -1)
                        openSavedWindow(savedWindows[index]);
                    return savedWindows.splice(index,1);
                }
            });
        }
        chrome.storage.local.set({savedWindows},()=>{
            console.log(`saved data => `,savedWindows);
        }); 
    });
}

function openSavedWindow({tabs}){
    let tabUrlList = [];
    tabs.forEach(({url})=>{
        tabUrlList.push(url);
    });
    chrome.windows.create({focused:true,url:tabUrlList,left:300});
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
    ev.stopPropagation();

    // this.parentNode.classList.add('hold');
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
    // this.parentNode.classList.remove('hold');
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
        if(destinationWindowId != currentWindowId){
            chrome.tabs.query({windowId:destinationWindowId,windowType:"normal"},(tab)=>{
                if(tab.length !== 0){
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
                        } else{
                            chrome.tabs.update(movedTabs.id,{active:true});
                        }
                        console.log(allWindows);
                        // chrome.tabs.query(movedTabs{active:true})
                    })
                } else{
                    alert("you cannot move to this window");
                }
            })  
        }
    }catch(error){
        console.log(error);
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
    savedWindowsNames,
};
