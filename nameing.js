import {savedWindowsNames as board_name} from "./board.js";
import {savedWindowsNames as event_name} from "./event.js";

function makeSavedWindowNameDiv(windowId){
    windowId = windowId.slice(0,-1);
    let nameDiv = document.createElement('div');
    let name = document.createElement('div');
    nameDiv.className = 'savedWindowNameDiv';
    nameDiv.appendChild(name);
    
    if(board_name[windowId])
        name.innerText = board_name[windowId];
    else
        name.innerText = event_name[windowId];

    nameDiv.addEventListener("click",(event)=>{openModifywindow(event.currentTarget,windowId,name.innerText)})

    return nameDiv;
}

function modifyName(changeName,windowId){
    chrome.storage.local.get(['savedWindows'],({savedWindows})=>{
        savedWindows.find((element,index)=>{
            if(element.windowId == windowId){
                savedWindows[index].name = changeName;
                return chrome.storage.local.set({savedWindows},()=>{
                    console.log(`changed name => `,savedWindows[index],changeName);
                }); 
            }
        });
    });
}

function openModifywindow(nameDiv,windowId,previousName){
    let changeName;
    setTimeout(()=>{
        changeName = prompt("type name if you want to change",previousName);
        if (!changeName)
            changeName = previousName;

        let name =  nameDiv.childNodes[0];
        name.textContent = changeName;
        event_name[windowId] = changeName;
        modifyName(changeName,windowId);
    },0);
}

export {makeSavedWindowNameDiv};