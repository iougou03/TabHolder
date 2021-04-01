chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.local.set({savedWindows:[]},()=>{
        console.log("saved");
    });
})