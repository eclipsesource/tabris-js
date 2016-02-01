function RenderElement(elem, params) {
    if (elem === void 0) { elem = "Composite"; }
    if (params === void 0) { params = {}; }
    return tabris.create(elem, params);
}
function RenderTree(elemName, params, children) {
    if (elemName === void 0) { elemName = "Composite"; }
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    var elem = RenderElement(elemName, params);
    children.forEach(function (child) {
        if (typeof child === 'function') {
            child().appendTo(elem);
        }
        else if (typeof child === 'undefined') {
        }
        else {
            child.appendTo(elem);
        }
    });
    return elem;
}
var inputType = function (param) {
    return Array.isArray(param) ? 'array' : typeof param;
};
//
//export function testElem (...elements) {
//    elements.forEach(element =>{
//        console.log(inputType (element) );
//    });
//}
var isValidString = function (param) {
    return typeof param === 'string' && param.length > 0;
};
var startsWith = function (string, start) {
    return string[0] === start;
};
var isSelector = function (param) {
    return isValidString(param) && (startsWith(param, '.') || startsWith(param, '#'));
};
var createRender = function (tagName) {
    return function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i - 0] = arguments[_i];
        }
        var children = [], params = {};
        //
        rest.forEach(function (element) {
            var elemType = inputType(element);
            if (elemType === 'array') {
                children = element;
            }
            else if (elemType === 'object') {
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
};
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
exports.Page = createRender("Page");
exports.WebView = createRender("WebView");
exports.TextView = createRender("TextView");
exports.ScrollView = createRender("ScrollView");
exports.TabFolder = createRender("TabFolder");
exports.Tab = createRender("Tab");
exports.Composite = createRender("Composite");
exports.ImageView = createRender("ImageView");
exports.CollectionView = createRender("CollectionView");
exports.Action = createRender("Action");
exports.Drawer = createRender("Drawer");
exports.PageSelector = createRender("PageSelector");
/* Alias */
exports.Text = createRender("TextView");
exports.Image = createRender("ImageView");
