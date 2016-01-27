var tabris_components_1 = require('./tabris-components');
function Spacer(config) {
    if (config === void 0) { config = {}; }
    return (tabris_components_1.Composite({
        layoutData: { height: config.height || 1, right: 0, left: 0, top: "prev()" },
        background: config.color || "rgba(0, 0, 0, 0.1)"
    }));
}
exports.Spacer = Spacer;
