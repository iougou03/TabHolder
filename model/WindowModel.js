export default class WindowModel{
    focused; // boolean
    id; // int
    top; // int
    left; // int
    tabList; // list

    constructor(
        focused,
        id,
        top,
        left,
    ){
        this.focused = focused;
        this.id = id;
        this.top = top;
        this.left = left;
        this.tabList = [];
    }

    addTab(TabModel){ // TabModel
        this.tabList.push(TabModel);
    }
}