chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.local.get(['savedWindows'],({savedWindows,savedNames})=>{
        if(savedWindows){
            console.log('get');
        }else{
            chrome.storage.local.set({savedWindows:[]},()=>{
                console.log("saved");
            });
        }
    })

})


