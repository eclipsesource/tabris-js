function RenderElement(elem, params) {
    if (elem === void 0) { elem = "Composite"; }
    if (params === void 0) { params = {}; }
    return tabris.create(elem, params);
}
function RenderTree(elemName, params, children, mixins) {
    if (elemName === void 0) { elemName = "Composite"; }
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    if (mixins === void 0) { mixins = []; }
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
    mixins.forEach(function (mixin) {
        if (typeof mixin === 'function') {
            mixin(elem);
        }
    });
    return elem;
}
var inputType = function (param) {
    return Array.isArray(param) ? 'array' : typeof param;
};
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
        var children = [], params = {}, mixins = [];
        // TODO: clean up these functions
        rest.forEach(function (element) {
            var elemType = inputType(element);
            if (elemType === 'array') {
                children = element;
            }
            else if (elemType === 'object') {
                params = element;
            }
            else if (elemType === 'function') {
                mixins.push(element);
            }
        });
        rest.forEach(function (element) {
            var elemType = inputType(element);
            // TODO: clean up these functions
            if (elemType === 'array') {
                children = element;
            }
            else if (elemType === 'object') {
                params = element;
            }
            else if (isSelector(element)) {
                // TODO: support both id and class
                if (startsWith(element, '#')) {
                    params['id'] = element.slice(1);
                }
                if (startsWith(element, '.')) {
                    params['class'] = element.slice(1);
                }
            }
            else if (isValidString(element)) {
                if (resolvers[tagName]) {
                    resolvers[tagName](params, element);
                }
            }
        });
        return RenderTree(tagName, params, children, mixins);
    };
};
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
/* Wildcard resolvers */
var resolvers = {
    Text: function (params, element) { return params["text"] = element; },
    TextView: function (params, element) { return params["text"] = element; },
    Image: function (params, element) { return params["image"] = element; },
    ImageView: function (params, element) { return params["image"] = element; },
    Tab: function (params, element) { return params["title"] = element; },
    Page: function (params, element) { return params["title"] = element; }
};
