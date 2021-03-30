chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.local.set({data:[]},()=>{
        console.log("saved");
    })
})