chrome.runtime.onInstalled.addListener(function(details){
    chrome.storage.sync.set({board:[]},()=>{
        console.log(`key number set!`);
    });
});