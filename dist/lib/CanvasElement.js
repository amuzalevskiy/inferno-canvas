"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yoga_layout_1 = require("yoga-layout");
var Node = yoga_layout_1.default.Node, EDGE_TOP = yoga_layout_1.default.EDGE_TOP, EDGE_RIGHT = yoga_layout_1.default.EDGE_RIGHT, EDGE_BOTTOM = yoga_layout_1.default.EDGE_BOTTOM, EDGE_ALL = yoga_layout_1.default.EDGE_ALL, EDGE_LEFT = yoga_layout_1.default.EDGE_LEFT, EDGE_START = yoga_layout_1.default.EDGE_START, EDGE_END = yoga_layout_1.default.EDGE_END, EDGE_VERTICAL = yoga_layout_1.default.EDGE_VERTICAL, EDGE_HORIZONTAL = yoga_layout_1.default.EDGE_HORIZONTAL, POSITION_TYPE_ABSOLUTE = yoga_layout_1.default.POSITION_TYPE_ABSOLUTE, DISPLAY_NONE = yoga_layout_1.default.DISPLAY_NONE, JUSTIFY_FLEX_START = yoga_layout_1.default.JUSTIFY_FLEX_START, ALIGN_STRETCH = yoga_layout_1.default.ALIGN_STRETCH, ALIGN_AUTO = yoga_layout_1.default.ALIGN_AUTO, FLEX_DIRECTION_COLUMN = yoga_layout_1.default.FLEX_DIRECTION_COLUMN, POSITION_TYPE_RELATIVE = yoga_layout_1.default.POSITION_TYPE_RELATIVE, WRAP_NO_WRAP = yoga_layout_1.default.WRAP_NO_WRAP, OVERFLOW_VISIBLE = yoga_layout_1.default.OVERFLOW_VISIBLE, DISPLAY_FLEX = yoga_layout_1.default.DISPLAY_FLEX;
var renderUtils_1 = require("./renderUtils");
var YGMeasureModeUndefined = 0, YGMeasureModeExactly = 1, YGMeasureModeAtMost = 2;
var defaultYogaStyles = {
    width: "auto",
    height: "auto",
    justifyContent: JUSTIFY_FLEX_START,
    alignItems: ALIGN_STRETCH,
    alignSelf: ALIGN_AUTO,
    alignContent: ALIGN_STRETCH,
    flexDirection: FLEX_DIRECTION_COLUMN,
    padding: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingBottom: 0,
    paddingRight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingStart: 0,
    paddingEnd: 0,
    margin: 0,
    marginTop: 0,
    marginLeft: 0,
    marginBottom: 0,
    marginRight: 0,
    marginStart: 0,
    marginEnd: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    border: 0,
    borderStart: 0,
    borderEnd: 0,
    borderTop: 0,
    borderLeft: 0,
    borderBottom: 0,
    borderRight: 0,
    position: POSITION_TYPE_RELATIVE,
    flexWrap: WRAP_NO_WRAP,
    flexBasis: "auto",
    flexGrow: 0,
    flexShrink: 1,
    overflow: OVERFLOW_VISIBLE,
    display: DISPLAY_FLEX,
};
var Style = /** @class */ (function () {
    function Style(el) {
        this.isMeasureFunctionSet = false;
        this.isTextNode = false;
        this.el = el;
    }
    Style.prototype.removeProperty = function (name) {
        this.el.markDirty();
        this.setProperty(name, undefined);
    };
    Style.prototype.setProperty = function (name, value) {
        this.el.markDirty();
        this[name] = value;
        var node = this.el._yogaNode;
        if (value === undefined) {
            value = defaultYogaStyles[name];
        }
        switch (name) {
            case "font":
            case "fontSize":
                if (this.fontSize && this.font) {
                    // this calculation takes time and memory
                    // when done during rendering
                    this._fullFont = this.fontSize + "px " + this.font;
                }
            // tslint:disable-next-line:no-switch-case-fall-through
            case "maxLines":
                if (this.isMeasureFunctionSet) {
                    // invalidate layout
                    if (!node.isDirty()) {
                        node.markDirty();
                    }
                }
                break;
            case "alignContent":
                node.setAlignContent(value);
                break;
            case "alignItems":
                node.setAlignItems(value);
                break;
            case "alignSelf":
                node.setAlignSelf(value);
                break;
            case "aspectRatio":
                node.setAspectRatio(value);
                break;
            case "display":
                this.el._flagsDirty = true;
                node.setDisplay(value);
                break;
            case "flex":
                node.setFlex(value);
                break;
            case "flexBasis":
                node.setFlexBasis(value);
                break;
            case "flexDirection":
                node.setFlexDirection(value);
                break;
            case "flexGrow":
                node.setFlexGrow(value);
                break;
            case "flexShrink":
                node.setFlexShrink(value);
                break;
            case "flexWrap":
                node.setFlexWrap(value);
                break;
            case "height":
                node.setHeight(value);
                this.validateMeasureFun();
                break;
            case "justifyContent":
                node.setJustifyContent(value);
                break;
            case "maxHeight":
                node.setMaxHeight(value);
                break;
            case "maxWidth":
                node.setMaxWidth(value);
                break;
            case "minHeight":
                node.setMinHeight(value);
                break;
            case "minWidth":
                node.setMinWidth(value);
                break;
            case "overflow":
                this.el._flagsDirty = true;
                node.setOverflow(value);
                break;
            case "position":
                this.el._isAbsolute = value === POSITION_TYPE_ABSOLUTE;
                node.setPositionType(value);
                break;
            case "width":
                node.setWidth(value);
                this.validateMeasureFun();
                break;
            case "top":
                node.setPosition(EDGE_TOP, value);
                break;
            case "right":
                node.setPosition(EDGE_RIGHT, value);
                break;
            case "bottom":
                node.setPosition(EDGE_BOTTOM, value);
                break;
            case "left":
                node.setPosition(EDGE_LEFT, value);
                break;
            case "margin":
                node.setMargin(EDGE_ALL, value);
                break;
            case "marginTop":
                node.setMargin(EDGE_TOP, value);
                break;
            case "marginLeft":
                node.setMargin(EDGE_LEFT, value);
                break;
            case "marginBottom":
                node.setMargin(EDGE_BOTTOM, value);
                break;
            case "marginRight":
                node.setMargin(EDGE_RIGHT, value);
                break;
            case "marginVertical":
                node.setMargin(EDGE_VERTICAL, value);
                break;
            case "marginHorizontal":
                node.setMargin(EDGE_HORIZONTAL, value);
                break;
            case "padding":
                node.setPadding(EDGE_ALL, value);
                break;
            case "paddingTop":
                node.setPadding(EDGE_TOP, value);
                break;
            case "paddingLeft":
                node.setPadding(EDGE_LEFT, value);
                break;
            case "paddingBottom":
                node.setPadding(EDGE_BOTTOM, value);
                break;
            case "paddingRight":
                node.setPadding(EDGE_RIGHT, value);
                break;
            case "paddingVertical":
                node.setPadding(EDGE_VERTICAL, value);
                break;
            case "paddingHorizontal":
                node.setPadding(EDGE_HORIZONTAL, value);
                break;
            case "border":
                this.el._flagsDirty = true;
                node.setBorder(EDGE_ALL, value);
                break;
            case "borderTop":
                this.el._flagsDirty = true;
                node.setBorder(EDGE_TOP, value);
                break;
            case "borderLeft":
                this.el._flagsDirty = true;
                node.setBorder(EDGE_LEFT, value);
                break;
            case "borderBottom":
                this.el._flagsDirty = true;
                node.setBorder(EDGE_BOTTOM, value);
                break;
            case "borderRight":
                this.el._flagsDirty = true;
                node.setBorder(EDGE_RIGHT, value);
                break;
            case "borderStart":
                this.el._flagsDirty = true;
                node.setBorder(EDGE_START, value);
                break;
            case "borderEnd":
                this.el._flagsDirty = true;
                node.setBorder(EDGE_END, value);
                break;
            case "paddingStart":
                node.setPadding(EDGE_START, value);
                break;
            case "paddingEnd":
                node.setPadding(EDGE_END, value);
                break;
            case "marginStart":
                node.setMargin(EDGE_START, value);
                break;
            case "marginEnd":
                node.setMargin(EDGE_END, value);
                break;
            case "background":
            case "borderRadius":
            case "borderColor":
            case "shadowColor":
            case "backgroundImage":
                this.el._flagsDirty = true;
                break;
        }
    };
    Style.prototype.setIsTextNode = function (isTextNode) {
        this.isTextNode = isTextNode;
        this.validateMeasureFun();
    };
    Style.prototype.validateMeasureFun = function () {
        if (this.isTextNode && (this.width === undefined || this.height === undefined)) {
            if (!this.isMeasureFunctionSet) {
                this.isMeasureFunctionSet = true;
                this.el._yogaNode.setMeasureFunc(this.createMeasureFunction(this.el));
            }
        }
        else if (this.isMeasureFunctionSet) {
            this.isMeasureFunctionSet = false;
            this.el._yogaNode.unsetMeasureFun();
        }
    };
    Style.prototype.createMeasureFunction = function (node) {
        return function (width, widthMode, height, heightMode) {
            var style = node.style;
            var fontSize = style.fontSize || 0;
            var font = fontSize + "px " + style.font;
            var targetWidth, targetHeight = 0;
            var lineHeight = fontSize * (style.lineHeight !== undefined ? style.lineHeight : 1.2);
            switch (widthMode) {
                case YGMeasureModeExactly:
                    // default behavior
                    targetWidth = width;
                    break;
                case YGMeasureModeAtMost:
                    var tw = renderUtils_1.measureText(font, node.content).width;
                    targetWidth = Math.min(tw, width);
                    break;
                default:
                case YGMeasureModeUndefined:
                    targetWidth = renderUtils_1.measureText(font, node.content).width;
                    break;
            }
            switch (heightMode) {
                case YGMeasureModeExactly:
                    targetHeight = height;
                    break;
                case YGMeasureModeAtMost:
                    var th = node.style.maxLines === undefined
                        ? lineHeight
                        : lineHeight *
                            renderUtils_1.countLines(node.content, font, targetWidth, node.style.maxLines || 1);
                    targetHeight = Math.min(th, height);
                    break;
                case YGMeasureModeUndefined:
                    targetHeight = node.style.maxLines === undefined
                        ? lineHeight
                        : lineHeight *
                            renderUtils_1.countLines(node.content, font, targetWidth, node.style.maxLines || 1);
                    break;
            }
            return { width: targetWidth, height: targetHeight };
        };
    };
    return Style;
}());
exports.HAS_CHILDREN = 1;
exports.HAS_BORDER = 2;
exports.HAS_BACKGROUND = 4;
exports.HAS_SHADOW = 8;
exports.HAS_BACKGROUND_IMAGE = 16;
exports.HAS_CLIPPING = 32;
exports.HAS_BORDER_RADIUS = 64;
exports.SKIP = 128;
exports.HAS_TEXT = 256;
exports.FORCE_CACHE = 512;
var CanvasElement = /** @class */ (function () {
    function CanvasElement(nodeName, registry) {
        this._flagsDirty = false;
        this._childrenLength = 0;
        this._flags = 0;
        this._isAbsolute = false;
        this._dirty = false;
        this.$cache = false;
        this._cachedRender = null;
        this.nodeName = nodeName;
        this.registry = registry;
        this._yogaNode = Node.create();
        this.style = new Style(this);
    }
    CanvasElement.prototype.markDirty = function () {
        if (!this._dirty) {
            this._dirty = true;
            if (this.parentNode) {
                this.parentNode.markDirty();
            }
            else if (this._doc) {
                this._doc.markDirty();
            }
        }
    };
    CanvasElement.prototype.getFlags = function () {
        if (this._flagsDirty) {
            this._flagsDirty = false;
            this._childrenLength = this.children ? this.children.length : 0;
            var style = this.style;
            if (style.display === DISPLAY_NONE) {
                this._flags = exports.SKIP;
            }
            var _yogaNode = this._yogaNode;
            var borderRadius = style.borderRadius || 0;
            var borderLeft = _yogaNode.getComputedBorder(EDGE_LEFT), borderTop = _yogaNode.getComputedBorder(EDGE_TOP), borderRight = _yogaNode.getComputedBorder(EDGE_RIGHT), borderBottom = _yogaNode.getComputedBorder(EDGE_BOTTOM);
            var hasBorder = style.borderColor !== undefined &&
                (borderTop > 0 ||
                    borderLeft > 0 ||
                    borderBottom > 0 ||
                    borderRight > 0);
            var shouldClipChildren = !!style.overflow || hasBorder;
            this._flags =
                (this.children && this.children.length ? exports.HAS_CHILDREN : 0) |
                    (hasBorder ? exports.HAS_BORDER : 0) |
                    (shouldClipChildren ? exports.HAS_CLIPPING : 0) |
                    (borderRadius > 0 ? exports.HAS_BORDER_RADIUS : 0) |
                    (style.backgroundImage ? exports.HAS_BACKGROUND_IMAGE : 0) |
                    (style.shadowColor && style.shadowColor !== "transparent" ? exports.HAS_SHADOW : 0) |
                    (style.background && style.background !== "transparent" ? exports.HAS_BACKGROUND : 0) |
                    (this.content !== undefined && this.content !== "" && style.color && style._fullFont ? exports.HAS_TEXT : 0) |
                    (this.$cache === true ? exports.FORCE_CACHE : 0);
        }
        return this._flags;
    };
    CanvasElement.prototype.forceCache = function (enabled) {
        this._flags = enabled ?
            this._flags | exports.FORCE_CACHE :
            this._flags & ~exports.FORCE_CACHE;
    };
    CanvasElement.prototype.free = function () {
        this._freeResourcesRecursive();
        if (this._yogaNode) {
            this._yogaNode.freeRecursive();
        }
    };
    CanvasElement.prototype._freeResourcesRecursive = function () {
        if (this._cachedRender) {
            this._cachedRender.setFree();
        }
        var children = this.children;
        if (children) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                child._freeResourcesRecursive();
            }
        }
    };
    Object.defineProperty(CanvasElement.prototype, "innerHTML", {
        set: function (value) {
            throw new Error("Unsupported operation.");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasElement.prototype, "textContent", {
        set: function (value) {
            if (value.length > 0) {
                throw new Error("Unsupported operation.");
            }
            if (this.children) {
                while (this.children.length) {
                    this.removeChild(this.children[0]);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    CanvasElement.prototype._setDoc = function (doc) {
        if (this._doc === doc) {
            return;
        }
        if (this.$EV) {
            if (this._doc) {
                for (var key in this.$EV) {
                    this._doc.removeEvent(key);
                }
            }
            if (doc) {
                for (var key in this.$EV) {
                    doc.addEvent(key);
                }
            }
        }
        this._doc = doc;
        if (this.children) {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i]._setDoc(doc);
            }
        }
    };
    CanvasElement.prototype.setAttribute = function (name, value) {
        this[name] = value;
        switch (name) {
            case "content":
                this._flagsDirty = true;
                this.markDirty();
                // invalidate layout
                if (this.style.isMeasureFunctionSet && !this._yogaNode.isDirty()) {
                    this._yogaNode.markDirty();
                }
                this.style.setIsTextNode(true);
                break;
            case "$cache":
                this._flagsDirty = true;
        }
    };
    CanvasElement.prototype.removeAttribute = function (name) {
        this[name] = undefined;
        switch (name) {
            case "content":
                this._flagsDirty = true;
                this.markDirty();
                // invalidate layout
                if (!this._yogaNode.isDirty()) {
                    this._yogaNode.markDirty();
                }
                this.style.setIsTextNode(false);
                break;
            case "$cache":
                this._flagsDirty = true;
        }
    };
    CanvasElement.prototype.appendChild = function (child) {
        this._flagsDirty = true;
        this.markDirty();
        this._verifyElementDetached(child);
        if (!this.children) {
            this.children = [];
        }
        this._yogaNode.insertChild(child._yogaNode, this.children.length);
        this.children.push(child);
        child.parentNode = this;
        child._setDoc(this._doc);
    };
    CanvasElement.prototype.insertBefore = function (newNode, nextNode) {
        this._flagsDirty = true;
        this.markDirty();
        this._verifyElementDetached(newNode);
        if (!this.children) {
            this.children = [];
        }
        var index = this.children.indexOf(nextNode);
        if (index !== -1) {
            this.children.splice(index, 0, newNode);
            this._yogaNode.insertChild(newNode._yogaNode, index);
        }
        else {
            this._yogaNode.insertChild(newNode._yogaNode, this.children.length);
            this.children.push(newNode);
        }
        newNode.parentNode = this;
        newNode._setDoc(this._doc);
    };
    CanvasElement.prototype.replaceChild = function (newDom, lastDom) {
        this._flagsDirty = true;
        this.markDirty();
        this._verifyElementDetached(newDom);
        // optimized, guaranteed by inferno
        // if (!this.children) {
        //     this.children = [];
        // }
        var index = this.children.indexOf(lastDom);
        if (index !== -1) {
            this.removeChild(lastDom);
            this._yogaNode.insertChild(newDom._yogaNode, index);
            this.children.splice(index, 0, newDom);
        }
    };
    CanvasElement.prototype.removeChild = function (childNode) {
        this._flagsDirty = true;
        this.markDirty();
        // optimized, guaranteed by inferno
        // if (!this.children) {
        //     this.children = [];
        // }
        var index = this.children.indexOf(childNode);
        if (index !== -1) {
            this._yogaNode.removeChild(childNode._yogaNode);
            this.children.splice(index, 1);
            childNode.parentNode = undefined;
            this.registry.addNodeToCleanupQueue(childNode);
            // required to count events
            childNode._setDoc(undefined);
        }
    };
    /*
     * EVENTS implementation
     */
    CanvasElement.prototype.addEventListener = function (name, fn) {
        // optimized
        // there is no way how to set 2 or more SAME events with inferno
        if (!this.$EV) {
            this.$EV = {};
        }
        this.$EV[name] = fn;
        if (this._doc) {
            this._doc.addEvent(name);
        }
    };
    CanvasElement.prototype.removeEventListener = function (name, fn) {
        // optimized
        // there is no way how to set 2 or more SAME events with inferno
        // optimized, guaranteed by inferno
        // if (!this.$EV) {
        //     return;
        // }
        delete this.$EV[name];
        this._doc.removeEvent(name);
    };
    /**
     * Verify that child is detached
     */
    CanvasElement.prototype._verifyElementDetached = function (child) {
        if (child.parentNode !== undefined) {
            child.parentNode.removeChild(child);
        }
        this.registry.removeNodeFromCleanupQueue(child);
    };
    return CanvasElement;
}());
exports.CanvasElement = CanvasElement;
//# sourceMappingURL=CanvasElement.js.map