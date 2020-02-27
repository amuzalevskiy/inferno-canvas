"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yoga_layout_1 = require("yoga-layout");
var DIRECTION_LTR = yoga_layout_1.default.DIRECTION_LTR, OVERFLOW_HIDDEN = yoga_layout_1.default.OVERFLOW_HIDDEN, OVERFLOW_SCROLL = yoga_layout_1.default.OVERFLOW_SCROLL, POSITION_TYPE_ABSOLUTE = yoga_layout_1.default.POSITION_TYPE_ABSOLUTE, EDGE_LEFT = yoga_layout_1.default.EDGE_LEFT, EDGE_TOP = yoga_layout_1.default.EDGE_TOP, EDGE_RIGHT = yoga_layout_1.default.EDGE_RIGHT, EDGE_BOTTOM = yoga_layout_1.default.EDGE_BOTTOM;
var renderUtils_1 = require("./renderUtils");
var ImageCache_1 = require("./ImageCache");
var renderQueue_1 = require("./renderQueue");
var ZIndexQueue_1 = require("./ZIndexQueue");
var LayoutEvent_1 = require("./LayoutEvent");
var TextureAtlas_1 = require("./TextureAtlas");
var CachedCanvasContext_1 = require("./CachedCanvasContext");
var ellipsis = String.fromCharCode(0x2026);
var defaultImageCache = ImageCache_1.ImageCache.createBasketsImageCache({
    basketLifetime: 1500,
    maxBaskets: 4
});
var defaultTextureAtlas = new TextureAtlas_1.TextureAtlas(256);
function getAncestorsAndSelf(node) {
    var ancestorsAndSelf = [];
    while (node) {
        ancestorsAndSelf.push(node);
        node = node.parentNode;
    }
    return ancestorsAndSelf;
}
function getImgBackgroundSourceRect(style, targetRect, imgWidth, imgHeight) {
    var sourceBox;
    if (style.backgroundPositionX && style.backgroundPositionY) {
        sourceBox = {
            left: style.backgroundPositionX,
            top: style.backgroundPositionY,
            width: targetRect.width,
            height: targetRect.height,
        };
    }
    else {
        // emulate css background-size: contains
        var sourceAspect = imgWidth / imgHeight, targetAspect = targetRect.width / targetRect.height;
        if (sourceAspect < targetAspect) {
            var sourceHeight = (imgWidth * targetRect.height) /
                targetRect.width;
            sourceBox = {
                left: 0,
                top: Math.floor((imgHeight - sourceHeight) * 0.5),
                width: imgWidth,
                height: sourceHeight,
            };
        }
        else {
            var sourceWidth = (imgHeight * targetRect.width) /
                targetRect.height;
            sourceBox = {
                left: Math.floor((imgWidth - sourceWidth) * 0.5),
                top: 0,
                width: sourceWidth,
                height: imgHeight,
            };
        }
    }
    return sourceBox;
}
/**
 * Caches image to offscreen canvas when it needs resizing
 */
function drawImageWithCache(ctx, backgroundImage, sourceRect, targetRect) {
    // // no TextureAtlas
    // ctx.drawImage(backgroundImage,
    //   sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height,
    //   targetRect.left, targetRect.top, targetRect.width, targetRect.height
    // );
    var spec = defaultTextureAtlas.getImage(backgroundImage, sourceRect, targetRect);
    ctx.drawImage(spec.source, spec.left, spec.top, spec.width, spec.height, targetRect.left, targetRect.top, targetRect.width, targetRect.height);
}
function isPointInNode(ctx, borderRadius, layoutLeft, layoutTop, w, h, offsetX, offsetY) {
    renderUtils_1.closedInnerBorderPath(ctx, 0, 0, 0, 0, borderRadius, layoutLeft, layoutTop, w, h);
    return ctx.isPointInPath(offsetX, offsetY) ? 1 : 0;
}
// source: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js#L37
function detectTouchDevice() {
    if ('ontouchstart' in window ||
        (window.DocumentTouch && document instanceof window.DocumentTouch)) {
        return true;
    }
    var prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-', ''];
    return window.matchMedia(['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('')).matches;
}
;
function reverseObject(obj) {
    var result = {};
    for (var key in obj) {
        result[obj[key]] = key;
    }
    return result;
}
var isTouchDevice = detectTouchDevice();
var eventsMapping = isTouchDevice ? {
    click: "click",
    mousedown: "touchstart",
    mousemove: "touchmove",
    mouseup: "touchend",
} : {
    click: "click",
    mousedown: "mousedown",
    mousemove: "mousemove",
    mouseup: "mouseup",
};
var reverseEventsMapping = reverseObject(eventsMapping);
var CanvasView = /** @class */ (function () {
    function CanvasView(canvas, spec, left, top, width, height, direction, defaultLineHeightMultiplier) {
        var _this = this;
        if (direction === void 0) { direction = DIRECTION_LTR; }
        if (defaultLineHeightMultiplier === void 0) { defaultLineHeightMultiplier = 1.3; }
        this._direction = DIRECTION_LTR;
        this._listenersState = {
            click: false,
            mousedown: false,
            mousemove: false,
            mouseup: false
        };
        this._currentQueue = new ZIndexQueue_1.ZIndexQueue();
        this.queues = [];
        this._processEvent = function (e) {
            var target;
            if (e instanceof MouseEvent) {
                target = _this.findHitTarget(e.offsetX, e.offsetY);
            }
            else {
                var targetTouch = e.touches.item(0) ||
                    e.changedTouches.item(0);
                if (!targetTouch) {
                    // no multi touch support
                    return;
                }
                var canvasRect = _this._canvas.getBoundingClientRect();
                var offsetX = targetTouch.clientX - canvasRect.left;
                var offsetY = targetTouch.clientY - canvasRect.top;
                target = _this.findHitTarget(offsetX, offsetY);
            }
            if (e.type === "mousemove" || e.type === "touchmove") {
                _this._trackMouseEnterAndLeave(e, target);
            }
            if (!target) {
                return;
            }
            LayoutEvent_1.bubbleEvent(e, reverseEventsMapping[e.type], target);
        };
        this._canvas = canvas;
        this._spec = spec;
        this._processEvent = this._processEvent.bind(this);
        this._ctx = canvas.getContext("2d");
        this._lastCachedContext = new CachedCanvasContext_1.CachedCanvasContext(this._ctx, this._ctx);
        this._defaultLineHeightMultiplier = defaultLineHeightMultiplier;
        this.x = left;
        this.y = top;
        this._width = width;
        this._height = height;
        this._direction = direction;
    }
    CanvasView.prototype._setDoc = function (doc) {
        this.doc = doc;
    };
    CanvasView.prototype.setTargetRegion = function (left, top, width, height) {
        this.x = left;
        this.y = top;
        this._width = width;
        this._height = height;
    };
    CanvasView.prototype.destroy = function () {
        this._unbindEventHandlers();
    };
    CanvasView.prototype._unbindEventHandlers = function () {
        this.bindEventHandlers({
            // only these 5 are supported
            click: 0,
            mousedown: 0,
            mousemove: 0,
            mouseup: 0
        });
    };
    CanvasView.prototype.bindEventHandlers = function (nextListenersState) {
        if (nextListenersState === void 0) { nextListenersState = this.doc.eventCounter; }
        for (var name_1 in LayoutEvent_1.mapEventType) {
            if (nextListenersState[name_1]) {
                if (!this._listenersState[name_1]) {
                    this._listenersState[name_1] = true;
                    this._canvas.addEventListener(eventsMapping[name_1], this._processEvent);
                }
            }
            else {
                if (this._listenersState[name_1]) {
                    this._listenersState[name_1] = false;
                    this._canvas.removeEventListener(eventsMapping[name_1], this._processEvent);
                }
            }
        }
    };
    CanvasView.prototype.findHitTarget = function (offsetX, offsetY) {
        // hits rendered region?
        var ctx = this._ctx;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this._width, this._height);
        if (!ctx.isPointInPath(offsetX, offsetY)) {
            return;
        }
        var start = performance.now();
        var queue = new ZIndexQueue_1.ZIndexQueue();
        var foundTarget = this._hitTest(offsetX, offsetY, this._spec, this.x, this.y, queue);
        var queueTarget = queue.hitTest(offsetX, offsetY, this);
        if (queueTarget) {
            foundTarget = queueTarget;
        }
        console.log("Hit test took " + (performance.now() - start).toFixed(1) + 'ms');
        return foundTarget;
    };
    CanvasView.prototype._hitTest = function (offsetX, offsetY, node, x, y, queue) {
        var ctx = this._ctx;
        var overflow = node.style.overflow;
        var shouldClipChildren = overflow === OVERFLOW_HIDDEN || overflow === OVERFLOW_SCROLL;
        var _yogaNode = node._yogaNode;
        var layoutLeft = _yogaNode.getComputedLeft() + x, layoutTop = _yogaNode.getComputedTop() + y;
        var nodeMatch = -1;
        if (shouldClipChildren) {
            nodeMatch = isPointInNode(ctx, node.style.borderRadius || 0, layoutLeft, layoutTop, _yogaNode.getComputedWidth(), _yogaNode.getComputedHeight(), offsetX, offsetY);
            if (!nodeMatch) {
                return;
            }
            queue = new ZIndexQueue_1.ZIndexQueue();
        }
        var foundTarget = this._hitTestChildren(node, queue, layoutLeft, layoutTop, offsetX, offsetY);
        if (shouldClipChildren) {
            var queueTarget = queue.hitTest(offsetX, offsetY, this);
            if (queueTarget) {
                foundTarget = queueTarget;
            }
        }
        if (!foundTarget) {
            if (nodeMatch === -1) {
                nodeMatch = isPointInNode(ctx, node.style.borderRadius || 0, layoutLeft, layoutTop, _yogaNode.getComputedWidth(), _yogaNode.getComputedHeight(), offsetX, offsetY);
            }
            if (nodeMatch) {
                foundTarget = node;
            }
        }
        return foundTarget;
    };
    CanvasView.prototype._hitTestChildren = function (node, queue, layoutLeft, layoutTop, offsetX, offsetY) {
        // if item has border
        // must verify if pointer is over border
        // also nodeMatch has a different meaning,
        // almost as overflow: hidden, but zIndex still should be investigated
        if (!node.children) {
            return undefined;
        }
        var foundTarget;
        for (var i = node.children.length - 1; i >= 0; i--) {
            var childNode = node.children[i];
            if (childNode.style.position === POSITION_TYPE_ABSOLUTE) {
                queue.unshift({
                    node: childNode,
                    x: layoutLeft,
                    y: layoutTop,
                });
            }
            else if (!foundTarget) {
                foundTarget = this._hitTest(offsetX, offsetY, node.children[i], layoutLeft, layoutTop, queue);
            }
            else {
                this._hitTestBuildZIndexQueue(node.children[i], layoutLeft, layoutTop, queue);
            }
        }
        return foundTarget;
    };
    /**
     * Only builds ZIndex queue...
     */
    CanvasView.prototype._hitTestBuildZIndexQueue = function (node, x, y, queue) {
        var overflow = node.style.overflow;
        if (overflow === OVERFLOW_HIDDEN || overflow === OVERFLOW_SCROLL) {
            return;
        }
        if (node.children) {
            var _yogaNode = node._yogaNode;
            var layoutLeft = _yogaNode.getComputedLeft() + x, layoutTop = _yogaNode.getComputedTop() + y;
            for (var i = node.children.length - 1; i >= 0; i--) {
                var childNode = node.children[i];
                if (childNode.style.position === POSITION_TYPE_ABSOLUTE) {
                    queue.unshift({
                        node: childNode,
                        x: layoutLeft,
                        y: layoutTop,
                    });
                }
                else {
                    this._hitTestBuildZIndexQueue(node.children[i], layoutLeft, layoutTop, queue);
                }
            }
        }
    };
    // tslint:disable:strict-type-predicates
    CanvasView.prototype._trackMouseEnterAndLeave = function (e, nextTarget) {
        // let event = new LayoutEvent(e, node);
        var previousTargets = getAncestorsAndSelf(this._previousTarget);
        var nextTargets = getAncestorsAndSelf(nextTarget);
        var i;
        for (i = 0; i < previousTargets.length; i += 1) {
            var pt = previousTargets[i];
            if (pt.$EV && typeof pt.$EV.onMouseLeave === "function" &&
                nextTargets.indexOf(pt) === -1) {
                pt.$EV.onMouseLeave(new LayoutEvent_1.LayoutEvent(e, "mouseleave", pt, false));
            }
        }
        for (i = 0; i < nextTargets.length; i += 1) {
            var nt = nextTargets[i];
            if (nt.$EV && typeof nt.$EV.onMouseEnter === "function" &&
                previousTargets.indexOf(nt) === -1) {
                nt.$EV.onMouseEnter(new LayoutEvent_1.LayoutEvent(e, "mouseenter", nt, false));
            }
        }
        this._previousTarget = nextTarget;
    };
    CanvasView.prototype._layout = function () {
        if (this._spec._yogaNode.isDirty()) {
            this._spec._yogaNode.calculateLayout(this._width, this._height, this._direction);
        }
    };
    CanvasView.prototype.render = function () {
        this._layout();
        var ctx = this._ctx;
        ctx.clearRect(this.x, this.y, this._width, this._height);
        // save before clipping
        ctx.save();
        this._addContext();
        // next line gives faster rendering for unknown reasons
        ctx.beginPath();
        ctx.rect(this.x, this.y, this._width, this._height);
        ctx.clip();
        this._renderNode(this._spec, this.x, this.y);
        // render absolutes within clipping rect
        this._currentQueue.render(this);
        ctx.restore();
        this._removeContext();
    };
    CanvasView.prototype._renderNode = function (node, x, y) {
        var ctx = this._ctx;
        var _yogaNode = node._yogaNode;
        var style = node.style;
        var overflow = style.overflow;
        var shouldClipChildren = !!overflow;
        // const shouldClipChildren = overflow === OVERFLOW_HIDDEN || overflow === OVERFLOW_SCROLL;
        var layoutLeft = _yogaNode.getComputedLeft() + x, layoutTop = _yogaNode.getComputedTop() + y, layoutWidth = _yogaNode.getComputedWidth(), layoutHeight = _yogaNode.getComputedHeight();
        var borderLeft = _yogaNode.getComputedBorder(EDGE_LEFT), borderTop = _yogaNode.getComputedBorder(EDGE_TOP), borderRight = _yogaNode.getComputedBorder(EDGE_RIGHT), borderBottom = _yogaNode.getComputedBorder(EDGE_BOTTOM);
        var borderRadius = style.borderRadius || 0;
        var hasBorder = !!style.borderColor &&
            (borderTop > 0 ||
                borderLeft > 0 ||
                borderBottom > 0 ||
                borderRight > 0);
        if (style.background) {
            this._lastCachedContext.setFillStyle(style.background);
            if (borderRadius > 0) {
                if (hasBorder) {
                    // the only found way to fix rendering artifacts with rounded borders
                    // 9 hrs wasted here
                    // this still doesn't support semi-transparent borders
                    // leaving this for future...
                    renderUtils_1.closedInnerBorderPath(ctx, borderLeft > 0.25 ? borderLeft - 0.25 : borderLeft, borderTop > 0.25 ? borderTop - 0.25 : borderTop, borderRight > 0.25 ? borderRight - 0.25 : borderRight, borderBottom ? borderBottom - 0.25 : borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
                }
                else {
                    renderUtils_1.closedInnerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
                }
                ctx.fill();
            }
            else {
                // optimize
                ctx.fillRect(layoutLeft + borderLeft, layoutTop + borderTop, layoutWidth - borderLeft - borderRight, layoutHeight - borderTop - borderBottom);
            }
        }
        if (style.shadowColor && style.shadowColor !== "transparent") {
            this._renderShadow(ctx, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight, style, hasBorder);
        }
        if (style.backgroundImage) {
            this._renderBackgroundImage(style, layoutLeft, layoutTop, layoutWidth, layoutHeight, borderLeft, borderTop, borderRight, borderBottom);
        }
        if (hasBorder) {
            this._renderBorder(style.borderColor, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
        }
        if (shouldClipChildren) {
            // set clipping
            this._clipNode(borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
            this._addContext();
        }
        if (node.children) {
            var len = node.children.length;
            for (var i = 0; i < len; i++) {
                var childNode = node.children[i];
                if (childNode.style.position === POSITION_TYPE_ABSOLUTE) {
                    this._currentQueue.push({
                        node: childNode,
                        x: layoutLeft,
                        y: layoutTop,
                    });
                }
                else {
                    this._renderNode(childNode, layoutLeft, layoutTop);
                }
            }
        }
        else if (node.content !== undefined) {
            var paddingLeft = _yogaNode.getComputedPadding(EDGE_LEFT), paddingTop = _yogaNode.getComputedPadding(EDGE_TOP), paddingRight = _yogaNode.getComputedPadding(EDGE_RIGHT), paddingBottom = _yogaNode.getComputedPadding(EDGE_BOTTOM);
            this._renderText(node, layoutLeft + paddingLeft + borderLeft, layoutTop + paddingTop + borderTop, layoutWidth -
                paddingLeft -
                paddingRight -
                borderLeft -
                borderRight, layoutHeight -
                paddingTop -
                paddingBottom -
                borderTop -
                borderBottom);
        }
        if (shouldClipChildren) {
            // render absolutes within clipping box
            this._currentQueue.render(this);
            this._removeContext();
        }
    };
    CanvasView.prototype._renderShadow = function (ctx, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight, style, hasBorder) {
        // a bit tricky
        // as shadow should not be visible under element
        // setup clipping of the content
        ctx.save();
        var shadowBlur = Math.round(style.shadowBlur) || 0, shadowOffsetX = Math.round(style.shadowOffsetX) || 0, shadowOffsetY = Math.round(style.shadowOffsetY) || 0;
        var borderIncrease = shadowBlur + Math.max(Math.abs(shadowOffsetX), Math.abs(shadowOffsetY));
        renderUtils_1.createBorderPath(ctx, borderIncrease, borderIncrease, borderIncrease, borderIncrease, borderIncrease + borderRadius, layoutLeft - borderIncrease, layoutTop - borderIncrease, layoutWidth + 2 * borderIncrease, layoutHeight + 2 * borderIncrease);
        ctx.clip();
        // init shadow
        ctx.shadowColor = style.shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
        ctx.beginPath();
        renderUtils_1.outerBorderPath(ctx, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight, true);
        ctx.fillStyle = hasBorder ? style.borderColor : style.background;
        ctx.fill();
        ctx.restore();
    };
    CanvasView.prototype._renderText = function (node, left, top, width, height) {
        var _yogaNode = node._yogaNode;
        var paddingLeft = _yogaNode.getComputedPadding(EDGE_LEFT), paddingTop = _yogaNode.getComputedPadding(EDGE_TOP), paddingRight = _yogaNode.getComputedPadding(EDGE_RIGHT), paddingBottom = _yogaNode.getComputedPadding(EDGE_BOTTOM);
        var style = node.style;
        if (!style.color || !style._fullFont) {
            // unable to render
            return;
        }
        var ctx = this._ctx;
        this._lastCachedContext.setFillStyle(style.color);
        this._lastCachedContext.setFont(style._fullFont);
        if (style.maxLines && style.maxLines > 1) {
            renderUtils_1.renderMultilineText(ctx, this._lastCachedContext, node.content, left + paddingLeft, top + paddingTop, width - paddingLeft - paddingRight, height - paddingTop - paddingBottom, style.lineHeight
                ? style.lineHeight
                : style.fontSize ? style.fontSize * this._defaultLineHeightMultiplier : 0, style.textAlign, style.verticalAlign, style.maxLines, style.textOverflow === "ellipsis" ? ellipsis : style.textOverflow);
        }
        else {
            renderUtils_1.renderText(ctx, this._lastCachedContext, node.content, left + paddingLeft, top + paddingTop, width - paddingLeft - paddingRight, height - paddingTop - paddingBottom, style.textAlign, style.verticalAlign, style.textOverflow === "ellipsis" ? ellipsis : style.textOverflow, node);
        }
    };
    CanvasView.prototype._renderBackgroundImage = function (style, layoutLeft, layoutTop, layoutWidth, layoutHeight, borderLeft, borderTop, borderRight, borderBottom) {
        var imgMaybe = defaultImageCache.get(style.backgroundImage);
        if (imgMaybe instanceof ImageCache_1.ImageCacheEntry) {
            var cacheEntry = imgMaybe;
            var targetRect = {
                left: layoutLeft + borderLeft,
                top: layoutTop + borderTop,
                width: layoutWidth -
                    borderLeft -
                    borderRight,
                height: layoutHeight -
                    borderTop -
                    borderBottom
            };
            var sourceRect = getImgBackgroundSourceRect(style, targetRect, cacheEntry.width, cacheEntry.height);
            drawImageWithCache(this._ctx, cacheEntry.image, sourceRect, targetRect);
        }
        else if (!(imgMaybe instanceof Error)) {
            // plan rendering
            renderQueue_1.renderQueue.renderAfter(this, imgMaybe);
        }
    };
    CanvasView.prototype._clipNode = function (borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight) {
        var ctx = this._ctx;
        renderUtils_1.closedInnerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
        ctx.clip();
    };
    CanvasView.prototype._addContext = function () {
        this.queues.push(this._currentQueue);
        this._currentQueue = new ZIndexQueue_1.ZIndexQueue();
        this._ctx.save();
        this._lastCachedContext = this._lastCachedContext.createNestedContext();
    };
    CanvasView.prototype._removeContext = function () {
        this._currentQueue = this.queues.pop();
        this._ctx.restore();
        this._lastCachedContext = this._lastCachedContext.getParentContext();
    };
    CanvasView.prototype._renderBorder = function (strokeStyle, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight) {
        var ctx = this._ctx;
        renderUtils_1.createBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
        this._lastCachedContext.setFillStyle(strokeStyle);
        ctx.fill();
    };
    return CanvasView;
}());
exports.CanvasView = CanvasView;
//# sourceMappingURL=CanvasView.js.map