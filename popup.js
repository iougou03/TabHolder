const folderBox= document.getElementById("folderBox");

// chrome.tabs.query({},(tab)=>{
//   tab.forEach(element => {
//     [element.favIconUrl,element.url];
//     console.log(element.url);
//   });
// })

function getWindows(){
  
  chrome.windows.getAll({populate:true}, (windows)=>{
    windows.forEach(window=> {
      console.log(window);
      createFolder(window);
    });

  })

  
}

function createFolder(window){
  let windowId = window.id;
  let thumbNailDiv = document.createElement('div');
  thumbNailDiv.id="thumbNail"; 

  let thumbNail = document.createElement('img');
  chrome.tabs.captureVisibleTab(windowId,(dataURL)=>{
    thumbNail.src = dataURL;
    thumbNail.alt = "URL image";
  });

  thumbNailDiv.appendChild(thumbNail);
  
  folderBox.appendChild (thumbNailDiv);
}

// chrome.tabs.captureVisibleTab((dataURL)=>{
//   // console.log(dataURL);
//   thumbNail.children[0].src = dataURL;
// })

function init(){
  getWindows();
}

init();