const borderBox = document.getElementById("borderBox")

function getBoard(){
    chrome.storage.sync.get(["board"],({board})=>{
        board.forEach(function(URLs,index){
            let id = `board ${index}`;
            craeteBoard(id,index,URLs);  
            console.log(id,URLs);
        })
    });
}
function craeteBoard(id,index,URLs){
    let thumbNailDiv = document.createElement('div');
    thumbNailDiv.className="thumbNail"; 
    thumbNailDiv.id = id; //`board ${index}`
    thumbNailDiv.addEventListener("click",function(){handleBoardClose(thumbNailDiv,index,URLs,0)});

    let btn = document.createElement('button');
    btn.className="thumbNailClose";
    btn.textContent = 'x';
    btn.addEventListener("click",function(){handleBoardClose(thumbNailDiv,index,URLs,1)});

    let img = document.createElement('img');
    img.src = "./images/dummy_images.png"; //need corretion
    img.className="tab";

    thumbNailDiv.appendChild(img);
    thumbNailDiv.appendChild(btn);
    borderBox.appendChild(thumbNailDiv);

}

function handleBoardClose(thumbNailDiv,index,URLs,mode){
    thumbNailDiv.remove();
    chrome.storage.sync.get(["board"],({board})=>{
        board.splice(index,1);
        chrome.storage.sync.set({board:board});
        console.log(URLs,board);
    })

    if (mode == 0){
        chrome.windows.create({focused:true,url:URLs,left:0,width:400},()=>{});
    }
}
export {getBoard, craeteBoard};