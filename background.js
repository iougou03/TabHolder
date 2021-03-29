chrome.runtime.onInstalled.addListener(function(details){
    chrome.storage.sync.set({board:[]},()=>{
        console.log(`board list has set!`);
    });
});

// can't we invoke the app for other windows in the background?
