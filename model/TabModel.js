export default class TabModel{
    active; // boolean
    url; // string
    title; // string
    favIconUrl; // string

    constructor(
        active,
        url,
        title,
        favIconUrl,
    ){
        this.active = active;
        this.url = url;
        this.title = title;
        this.favIconUrl = favIconUrl;
    }
}