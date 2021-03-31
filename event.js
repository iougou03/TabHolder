import {makeContainer,appendItem,UNKNOWN_PATH} from "./board.js"; 

function handleItemClicked(ev,windowId){
    chrome.windows.update(windowId,{focused:true});
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
            // console.log(tabs);
            makeContainer(id,tabs,false)
        })
    })
    chrome.windows.onRemoved.addListener(windowId=>{
        document.getElementById(windowId).remove();
        console.log("removed");
    });
}

function handleTabEvent(){
    chrome.tabs.onCreated.addListener(({windowId,id,favIconUrl,url})=>{
        if (!favIconUrl)
            favIconUrl = UNKNOWN_PATH;
        let tab = {id,favIconUrl,url}
        appendItem(windowId,tab);
    })
    chrome.tabs.onRemoved.addListener(tabId=>{
        document.getElementById(tabId).remove();
    });
    // chrome.tabs.onMoved.addListener((tabId,moveInfo)=>{
    //     let fromDiv = document.getElementById(tabId);
    //     let parent;
    //     let toDiv; 
    //     if(moveInfo.fromIndex == 0){
    //         parent = fromDiv.parentNode.parentNode.childNodes[3] //otherpages
    //     }
    //     else if(moveInfo.toIndex == 0){
    //         parent = fromDiv.parentNode.parentNode.childNodes[2] //firstpage
    //     }
    //     console.log(tabId,moveInfo,parent)
        
    // });
    chrome.tabs.onUpdated.addListener((tabId,{favIconUrl},{})=>{
        if(favIconUrl){
            chrome.tabs.get(tabId,()=>{
                let searchFav = document.getElementById(tabId);
                if (!favIconUrl)
                    favIconUrl = UNKNOWN_PATH;
                searchFav.src=favIconUrl;
                })
            }
        }
    );
}

function handleBtnClick(ev){
    let num = Number(ev.target.id);
    let windowId = Number(ev.currentTarget.parentNode.parentNode.id); 
    if (num){ // click save button
        let searchWindow = document.getElementById(windowId)
        let first = searchWindow.children[2];
        let others = searchWindow.children[3];
        let tabIdList = [first.children[0].id];
        let favList = [first.children[0].src];
        let urlList  =[first.children[0].alt];

        console.log(searchWindow,first,others,others.children.length )
        // console.log(first.children[0].id,first.children[0].src,first.children[0].alt)

        if(others.children.length !== 0){
            let children =Array.from(others.children);
            // console.log(children);
            children.forEach(img => {
                console.log(img.id,img.src,img.alt);
                tabIdList.push(img.id);
                favList.push(img.src);
                urlList.push(img.alt);
            });
        }

        let saveData = {
            windowId,
            tabIdList,
            favList,
            urlList
        }
        chrome.storage.local.get(['data'],({data})=>{
            // console.log(data)
            data.push(saveData);
            chrome.storage.local.set({data},()=>{
                alert("saved");
            });
        });
        
    } else{
        chrome.windows.remove(windowId);
    }

}
export {handleItemClicked, handleItemHover, handleWindowEvent,handleBtnClick,handleTabEvent};
