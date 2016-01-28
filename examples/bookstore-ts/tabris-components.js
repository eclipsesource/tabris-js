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
        else {
            child.appendTo(elem);
        }
    });
    return elem;
}
function Page(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("Page", params, children);
}
exports.Page = Page;
function WebView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("WebView", params, children);
}
exports.WebView = WebView;
function TextView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("TextView", params, children);
}
exports.TextView = TextView;
function ScrollView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("ScrollView", params, children);
}
exports.ScrollView = ScrollView;
function TabFolder(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("TabFolder", params, children);
}
exports.TabFolder = TabFolder;
function Tab(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("Tab", params, children);
}
exports.Tab = Tab;
function Composite(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("Composite", params, children);
}
exports.Composite = Composite;
function ImageView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("ImageView", params, children);
}
exports.ImageView = ImageView;
function CollectionView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("CollectionView", params, children);
}
exports.CollectionView = CollectionView;
function Action(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("Action", params, children);
}
exports.Action = Action;
function Drawer(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("Drawer", params, children);
}
exports.Drawer = Drawer;
function PageSelector(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("PageSelector", params, children);
}
exports.PageSelector = PageSelector;
/* Alias */
function Text(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return TextView(params, children);
}
exports.Text = Text;
function Image(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return ImageView(params, children);
}
exports.Image = Image;
