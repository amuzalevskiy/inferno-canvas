"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = require("inferno");
exports.Component = inferno_1.Component;
exports.createFragment = inferno_1.createFragment;
exports.createVNode = inferno_1.createVNode;
exports.createComponentVNode = inferno_1.createComponentVNode;
exports.createTextVNode = inferno_1.createTextVNode;
exports.normalizeProps = inferno_1.normalizeProps;
var inferno_create_element_1 = require("inferno-create-element");
exports.createElement = inferno_create_element_1.createElement;
var CanvasElement_1 = require("./CanvasElement");
var parseStyle_1 = require("./parseStyle");
exports.parseStyle = parseStyle_1.parseStyle;
var CanvasView_1 = require("./CanvasView");
var CanvasDocument_1 = require("./CanvasDocument");
var AnimationFrameHandler_1 = require("./AnimationFrameHandler");
var CanvasElementRegistry_1 = require("./CanvasElementRegistry");
var registry = new CanvasElementRegistry_1.CanvasElementRegistry();
inferno_1.setCreateElementFunction(function (type) {
    return new CanvasElement_1.CanvasElement(type, registry);
});
exports.animationFrameHandler = new AnimationFrameHandler_1.AnimationFrameHandler(registry, true);
// plans any function before next render
function _requestAnimationFrame(cb) {
    exports.animationFrameHandler._checkEnqueued();
    return exports.animationFrameHandler._pushCb(cb);
}
exports.requestAnimationFrame = _requestAnimationFrame;
function _cancelAnimationFrame(id) {
    exports.animationFrameHandler._removeCb(id);
}
exports.cancelAnimationFrame = _cancelAnimationFrame;
function mount(component, canvas, left, top, width, height) {
    exports.animationFrameHandler._checkEnqueued();
    if (canvas["canvasView"]) {
        var canvasView_1 = canvas["canvasView"];
        var canvasDOM_1 = canvas["canvasDOM"];
        canvasDOM_1.style.setProperty("width", width);
        canvasDOM_1.style.setProperty("height", height);
        canvasView_1.setTargetRegion(left, top, width, height);
        inferno_1.render(component, canvasDOM_1);
        canvasView_1.render();
        return;
    }
    var canvasDOM = new CanvasElement_1.CanvasElement("root", registry);
    canvasDOM.style.setProperty("width", width);
    canvasDOM.style.setProperty("height", height);
    var canvasView = new CanvasView_1.CanvasView(canvas, canvasDOM, left, top, width, height);
    exports.animationFrameHandler._addView(canvasView);
    canvas["canvasView"] = canvasView;
    canvas["canvasDOM"] = canvasDOM;
    var canvasDoc = new CanvasDocument_1.CanvasDocument(exports.animationFrameHandler);
    canvasDOM._setDoc(canvasDoc);
    canvasView._setDoc(canvasDoc);
    inferno_1.render(component, canvasDOM);
    canvasView.render();
    canvasView.bindEventHandlers();
    return canvasDoc;
}
exports.mount = mount;
function unmount(canvas) {
    if (!canvas["canvasView"]) {
        return;
    }
    var canvasView = canvas["canvasView"];
    var canvasDOM = canvas["canvasDOM"];
    exports.animationFrameHandler._removeView(canvasView);
    inferno_1.render(null, canvasDOM);
    canvasView.destroy();
    canvasDOM.free();
    delete canvas["canvasView"];
    delete canvas["canvasDOM"];
}
exports.unmount = unmount;
//# sourceMappingURL=inferno-canvas.js.map