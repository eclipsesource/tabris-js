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
        else if(typeof child === 'undefined'){
            // Don't do anything without an element
        }
        else {
            child.appendTo(elem);
        }
    })
    return elem;
}


const inputType =
    param =>
    Array.isArray(param)? 'array' : typeof param;

//
//export function testElem (...elements) {
//    elements.forEach(element =>{
//        console.log(inputType (element) );
//    });
//}



const isValidString =
    param =>
    typeof param === 'string' && param.length > 0;

const startsWith =
    (string, start) =>
    string[0] === start;

const isSelector =
    param =>
    isValidString(param) && (startsWith(param, '.') || startsWith(param, '#'));


const createRender = function(tagName){
    return (...rest) => {
        let children = [], params= {};
        //
        rest.forEach(element =>{
            let elemType = inputType (element);
            if(elemType === 'array'){
                children = element;
            }
            else if(elemType === 'object'){
                params = element;
            }
        });
        return RenderTree(tagName, params, children);

        //if (isSelector(first)) {
        //    return RenderTree(tagName, first, ...rest);
        //} else {
        //    return RenderTree(tagName, params, children);
        //}
    };

}
    //() =>
    //    tagName =>
    //        (first, ...rest) => {
    //            if (isSelector(first)) {
    //                return RenderTree(tagName + first, ...rest);
    //            } else {
    //                return RenderTree(tagName, first, ...rest);
    //            }
    //        };


//export default
//h => {
//    const createTag = node();
//    const exported = { TAG_NAMES, isSelector, createTag };
//    TAG_NAMES.forEach(n => {
//        exported[n] = createTag(n);
//    });
//    return exported;
//};




export const Page = createRender ("Page");
export const WebView = createRender ("WebView");
export const TextView = createRender ("TextView");
export const ScrollView = createRender ("ScrollView");
export const TabFolder = createRender ("TabFolder");
export const Tab = createRender ("Tab");
export const Composite = createRender ("Composite");
export const ImageView = createRender ("ImageView");
export const CollectionView = createRender ("CollectionView");
export const Action = createRender ("Action");
export const Drawer = createRender ("Drawer");
export const PageSelector = createRender ("PageSelector");

/* Alias */
export const Text = createRender ("TextView");
export const Image = createRender ("ImageView");
