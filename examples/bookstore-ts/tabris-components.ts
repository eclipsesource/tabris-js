declare var tabris: any;

function RenderElement (elem = "Composite", params= {}) {
    return tabris.create(elem, params);
}

function RenderTree (elemName = "Composite", params= {}, children = []) {
    let elem = RenderElement(elemName,params);
    children.forEach((child) => {
        if(typeof child === 'function'){
            child().appendTo(elem);
        }
        else {
            child.appendTo(elem);
        }
    })
    return elem;
}


export function Page (params = {}, children = []){
    return RenderTree("Page", params,children);
}

export function WebView (params = {}, children = []){
    return RenderTree("WebView", params,children);
}

export function TextView (params = {}, children = []){
    return RenderTree("TextView", params,children);
}

export function Text (params = {}, children = []){
    return RenderTree("TextView", params,children);
}

export function ScrollView (params = {}, children = []){
    return RenderTree("ScrollView", params,children);
}

export function TabFolder (params = {}, children = []){
    return RenderTree("TabFolder", params,children);
}

export function Tab (params = {}, children = []){
    return RenderTree("Tab", params,children);
}

export function Composite (params = {}, children = []){
    return RenderTree("Composite", params,children);
}

export function ImageView (params = {}, children = []){
    return RenderTree("ImageView", params,children);
}

export function CollectionView (params = {}, children = []){
    return RenderTree("CollectionView", params,children);
}

export function Action (params = {}, children = []){
    return RenderTree("Action", params,children);
}

export function Drawer (params = {}, children = []){
    return RenderTree("Drawer", params,children);
}

export function PageSelector (params = {}, children = []){
    return RenderTree("PageSelector", params,children);
}
