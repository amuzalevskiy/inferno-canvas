"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var BasketsCache_1 = require("./BasketsCache");
/**
 * Caches images of exact size on offscreen canvas
 *
 * This prevents
 */
var TextureAtlas = /** @class */ (function () {
    function TextureAtlas(maxCachedTargetHeight) {
        var _this = this;
        if (maxCachedTargetHeight === void 0) { maxCachedTargetHeight = 256; }
        this.canvas = document.createElement("canvas");
        this.context2d = this.canvas.getContext("2d");
        this.unusedSpace = 0;
        this.cache = new BasketsCache_1.BasketsCache({
            // don't keep image too long
            maxBaskets: 2,
            onRemove: function (value, key) {
                if (value.source !== _this.canvas) {
                    // nothing to do, as it is cached on separate canvas
                    return;
                }
                _this.unusedSpace += value.width * value.height;
            }
        });
        this.emptySpaceStart = 0;
        this.partiallyFreeRows = {};
        this.maxCachedTargetHeight = maxCachedTargetHeight;
        this.resizeCanvas(512);
    }
    TextureAtlas.prototype.resizeCanvas = function (width) {
        this.canvas.width = width;
        this.canvas.height = this.maxCachedTargetHeight;
    };
    TextureAtlas.prototype.getImage = function (img, sourceRect, targetRect) {
        var key = this.getKey(img, sourceRect, targetRect);
        var result = this.cache.get(key);
        if (!result) {
            if (targetRect.height > this.maxCachedTargetHeight) {
                if (sourceRect.width === targetRect.width && sourceRect.height === targetRect.height) {
                    // no resizing, so no need to cache resize result
                    return __assign({ source: img }, sourceRect);
                }
                // cache on separate canvas
                result = this.cacheOnSeparateCanvas(key, img, sourceRect, targetRect);
            }
            else {
                result = this.cacheOnMainCanvas(key, img, sourceRect, targetRect);
            }
        }
        return result;
    };
    TextureAtlas.prototype.getKey = function (img, sourceBox, targetBox) {
        return img.id + 't' +
            ((targetBox.width << 13 + targetBox.height) * 67108864 /* 2 ^ 26 */ + (sourceBox.width << 13 + sourceBox.height)) +
            "s" + (sourceBox.top << 13 + sourceBox.left);
    };
    TextureAtlas.prototype.cacheOnSeparateCanvas = function (key, img, sourceRect, targetRect) {
        var canvas = document.createElement("canvas");
        canvas.width = targetRect.width;
        canvas.height = targetRect.height;
        canvas.getContext("2d").drawImage(img, sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height, 0, 0, targetRect.width, targetRect.height);
        var result = {
            source: canvas,
            top: 0,
            left: 0,
            width: targetRect.width,
            height: targetRect.height
        };
        this.cache.set(key, result);
        return result;
    };
    TextureAtlas.prototype.cacheOnMainCanvas = function (key, img, sourceRect, targetRect) {
        var maybeRow = this.partiallyFreeRows[targetRect.width];
        if (!maybeRow) {
            this.partiallyFreeRows[targetRect.width] = maybeRow = {
                left: this.emptySpaceStart,
                currentTop: 0
            };
            this.emptySpaceStart += targetRect.width;
        }
        var freeSpace = this.maxCachedTargetHeight - maybeRow.currentTop;
        if (freeSpace < targetRect.height) {
            // create new row:
            // 1. claim unused space
            this.unusedSpace += freeSpace * targetRect.width;
            // 2. addRow
            this.partiallyFreeRows[targetRect.width] = maybeRow = {
                left: this.emptySpaceStart,
                currentTop: 0
            };
            this.emptySpaceStart += targetRect.width;
        }
        this.context2d.drawImage(img, sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height, maybeRow.left, maybeRow.currentTop, targetRect.width, targetRect.height);
        var result = {
            source: this.canvas,
            top: maybeRow.currentTop,
            left: maybeRow.left,
            width: targetRect.width,
            height: targetRect.height
        };
        maybeRow.currentTop += targetRect.height;
        this.cache.set(key, result);
        return result;
    };
    return TextureAtlas;
}());
exports.TextureAtlas = TextureAtlas;
//# sourceMappingURL=TextureAtlas.js.map