const borderBox = document.getElementById("borderBox")

function getBoard(){
    chrome.storage.sync.get(["board"],({board})=>{
        board.forEach(function(element,index){
            let i = `board ${index}`;
            craeteBoard(i);  
            console.log(i);
        })
    });
}
function craeteBoard(index){
    let thumbNailDiv = document.createElement('div');
    thumbNailDiv.className="thumbNail"; 
    thumbNailDiv.id = index; //`board ${index}`

    let btn = document.createElement('button');
    btn.className="thumbNailClose";
    btn.textContent = 'x';

    let img = document.createElement('img');
    img.src = "./images/dummy_images.png";
    img.className="tab";

    thumbNailDiv.appendChild(img);
    thumbNailDiv.appendChild(btn);
    borderBox.appendChild(thumbNailDiv);

}

export {getBoard, craeteBoard};