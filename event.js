import {allWindows,UNKNOWN_PATH,makeItem} from "./board.js"; 

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
            console.log(tabs);
        ////////////////////////////////////////need work/////////////////////////////////
        })
    })
    chrome.windows.onRemoved.addListener(windowId=>{
        document.getElementById(String(windowId)).remove();
        console.log("removed");
    });
}

function handleTabEvent(){
    chrome.tabs.onCreated.addListener((tab)=>{
        if (tab.windowId in allWindows){
            let bodyDiv = document.getElementById(tab.windowId).childNodes[3];
            let img = document.createElement('img');
            let tabs = allWindows[String(tab.windowId)].tabs;

            img.id = String(tab.id)+'t'
            img.className = 'favImg';
            if (!tab.favIconUrl)
                tab.favIconUrl = UNKNOWN_PATH;
            img.src = tab.favIconUrl;
            img.alt = tab.title;

            if (tab.index !== tabs.length-1){
                bodyDiv.insertBefore(img,bodyDiv.childNodes[tab.index-1]);
            } else{
                bodyDiv.appendChild(img);
            }

            tabs.splice(tab.index,0,tab);
            console.log(allWindows[String(tab.windowId)])
        }
    })
    chrome.tabs.onRemoved.addListener((tabId,{isWindowClosing,windowId})=>{
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
            console.log(allWindows[windowId]);
        }
    });
    chrome.tabs.onMoved.addListener((tabId,moveInfo)=>{
////////////////////////////////////////need work/////////////////////////////////
        console.log(tabId,moveInfo,parent)
    });
    chrome.tabs.onUpdated.addListener((tabId,{favIconUrl},{})=>{
////////////////////////////////////////need work/////////////////////////////////
        // if(favIconUrl){
        //     chrome.tabs.get(tabId,()=>{
        //         let searchFav = document.getElementById(tabId);
        //         if (!favIconUrl)
        //             favIconUrl = UNKNOWN_PATH;
        //         searchFav.src=favIconUrl;
        //         })
        //     }
        });
}

function handleBtnClicked(ev){
    let num = Number(ev.target.id);
    let windowId = ev.currentTarget.parentNode.parentNode.id; 
    if (num === 2){ // click save button
        chrome.windows.remove(Number(windowId));
        changeSaved(windowId,num);
        makeItem(windowId+"s",allWindows[Number(windowId)].tabs,false,true);
    } else if (num === 1){ // click close button
        chrome.windows.remove(Number(windowId));
    } else if (num===0){ //click delete button
        changeSaved(windowId,num);
        document.getElementById(windowId).remove();
    } else{ //click open button
    ////////////////////////////////////////need work/////////////////////////////////
    }
}

function changeSaved(windowId,mode){ // mode 2 -> save, 0 -> delete
    chrome.storage.local.get(['savedWindows'],({savedWindows})=>{
        if (mode === 2){
            savedWindows.push(allWindows[windowId]);
            delete allWindows[windowId]
        } else{ //saved windows have letter s with their id
            savedWindows.find((element,index)=>{
                if(element.windowId == Number(windowId.slice(0,-1))){
                    savedWindows.splice(index,1);
                    delete allWindows[windowId.slice(0,-1)];
                    return
                };
            })
        }
        chrome.storage.local.set({savedWindows},()=>{
            console.log(`saved data => `,savedWindows,'\n',allWindows);
        }); 
            
    });
}
export {handleItemClicked, handleItemHover, handleBtnClicked, handleWindowEvent, handleTabEvent, allWindows};
