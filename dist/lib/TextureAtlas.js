"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SortedArray_1 = require("./SortedArray");
var TextureAtlas = /** @class */ (function () {
    function TextureAtlas(initialWidth, initialHeight) {
        if (initialWidth === void 0) { initialWidth = 512; }
        if (initialHeight === void 0) { initialHeight = 1024; }
        this.canvas = document.createElement("canvas");
        this.context2d = this.canvas.getContext("2d");
        this.canvas.width = initialWidth;
        this.canvas.height = initialHeight;
        this.allocator = new TextureAtlasAllocator(initialWidth, initialHeight);
    }
    TextureAtlas.prototype.allocate = function (width, height) {
        var rect = this.allocator.allocate(width, height);
        while (!rect) {
            this.grow();
            rect = this.allocator.allocate(width, height);
        }
        return new TextureAtlasRegion(this.canvas, this.context2d, rect, rect.left, rect.top, width, height);
    };
    TextureAtlas.prototype.grow = function () {
        // always grow in 2 times
        if (this.canvas.width < this.canvas.height) {
            var oldWidth = this.canvas.width;
            this.canvas.width = oldWidth * 2;
            this.allocator.register(new TextureAtlasAllocatorRect(this.allocator, null, oldWidth, 0, oldWidth, this.canvas.height));
        }
        else {
            var oldHeight = this.canvas.height;
            this.canvas.height = oldHeight * 2;
            this.allocator.register(new TextureAtlasAllocatorRect(this.allocator, null, 0, oldHeight, this.canvas.width, oldHeight));
        }
        // important to log?
        console.log("texture atlas grow to " + this.canvas.width + "x" + this.canvas.height);
    };
    return TextureAtlas;
}());
exports.TextureAtlas = TextureAtlas;
var TextureAtlasRegion = /** @class */ (function () {
    function TextureAtlasRegion(canvas, context2d, rect, left, top, width, height) {
        this.destroyed = false;
        this.canvas = canvas;
        this.context2d = context2d;
        this.rect = rect;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    TextureAtlasRegion.prototype.idDestroyed = function () {
        return this.destroyed;
    };
    TextureAtlasRegion.prototype.setFree = function () {
        this.rect.setFree();
        this.destroyed = true;
    };
    return TextureAtlasRegion;
}());
exports.TextureAtlasRegion = TextureAtlasRegion;
var TextureAtlasAllocator = /** @class */ (function () {
    function TextureAtlasAllocator(width, height) {
        this.rectsByWidth = new SortedArray_1.SortedArray("square");
        this.rectsByHeight = new SortedArray_1.SortedArray("square");
        this.width = width;
        this.height = height;
        this.register(new TextureAtlasAllocatorRect(this, null, 0, 0, width, height));
    }
    TextureAtlasAllocator.prototype.register = function (rects) {
        this.rectsByWidth.insert(rects);
        this.rectsByHeight.insert(rects);
    };
    TextureAtlasAllocator.prototype.unregister = function (rects) {
        this.rectsByWidth.removeByValue(rects);
        this.rectsByHeight.removeByValue(rects);
    };
    /**
     * Allocates region which size exceeds provided width and height
     *
     * This logic leaves unusable piece with minimal possible square
     */
    TextureAtlasAllocator.prototype.allocate = function (width, height) {
        var square = width * height;
        var bestMatch = null;
        var minimalEstimate = Infinity;
        var totalRects = this.rectsByWidth.length;
        // go by width first
        for (var i = this.rectsByWidth.greaterThan(height, true); i < totalRects; i++) {
            var rectToCheck = this.rectsByWidth.get(i);
            if (rectToCheck.width * height > square + minimalEstimate) {
                // short path
                break;
            }
            var estimate = rectToCheck.estimateAllocation(width, height);
            if (estimate !== -1) {
                if (estimate < minimalEstimate) {
                    minimalEstimate = estimate;
                    bestMatch = rectToCheck;
                }
            }
        }
        // go by height
        for (var i = this.rectsByHeight.greaterThan(height, true); i < totalRects; i++) {
            var rectToCheck = this.rectsByHeight.get(i);
            if (width * rectToCheck.height > square + minimalEstimate) {
                // short path
                break;
            }
            var estimate = rectToCheck.estimateAllocation(width, height);
            if (estimate !== -1) {
                if (estimate < minimalEstimate) {
                    minimalEstimate = estimate;
                    bestMatch = rectToCheck;
                }
            }
        }
        return bestMatch !== null ? bestMatch.allocate(width, height) : null;
    };
    return TextureAtlasAllocator;
}());
var TextureAtlasAllocatorRect = /** @class */ (function () {
    function TextureAtlasAllocatorRect(allocator, parent, left, top, width, height) {
        this.used = true;
        this.allocator = allocator;
        this.parent = parent;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.square = width * height;
    }
    TextureAtlasAllocatorRect.prototype.estimateAllocation = function (width, height) {
        if (width > this.width || height > this.height) {
            return -1;
        }
        return Math.min((this.width - width) * height, width * (this.height - height));
    };
    TextureAtlasAllocatorRect.prototype.allocate = function (width, height) {
        if (width * height * 1.05 > this.width * this.height) {
            // the sizes almost match...
            // don't divide further...
            this.setUsed();
            return this;
        }
        if ((this.width - width) * height > width * (this.height - height)) {
            return this.allocateDivideWidth(width, height);
        }
        else {
            return this.allocateDivideHeight(width, height);
        }
    };
    TextureAtlasAllocatorRect.prototype.allocateDivideWidth = function (width, height) {
        this.children = [
            new TextureAtlasAllocatorRect(this.allocator, this, this.left, this.top, width, height),
            new TextureAtlasAllocatorRect(this.allocator, this, this.left + width, this.top, (this.width - width), this.height),
            new TextureAtlasAllocatorRect(this.allocator, this, this.left, this.top + height, width, (this.height - height))
        ];
        this.setUsed();
        this.allocator.register([this.children[1], this.children[2]]);
        this.children[0].used = true;
        return this.children[0];
    };
    TextureAtlasAllocatorRect.prototype.allocateDivideHeight = function (width, height) {
        this.children = [
            new TextureAtlasAllocatorRect(this.allocator, this, this.left, this.top, width, height),
            new TextureAtlasAllocatorRect(this.allocator, this, this.left + width, this.top, (this.width - width), height),
            new TextureAtlasAllocatorRect(this.allocator, this, this.left, this.top + height, this.width, (this.height - height))
        ];
        this.setUsed();
        this.allocator.register([this.children[1], this.children[2]]);
        this.children[0].used = true;
        return this.children[0];
    };
    TextureAtlasAllocatorRect.prototype.setUsed = function () {
        this.used = true;
        this.allocator.unregister(this);
    };
    TextureAtlasAllocatorRect.prototype.setFree = function () {
        this.used = false;
        this.allocator.register(this);
        if (this.parent) {
            this.parent.childSetFree();
        }
    };
    TextureAtlasAllocatorRect.prototype.childSetFree = function () {
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            if (child.used) {
                return;
            }
        }
        // all children isFree
        this.allocator.unregister(this.children);
        this.children = undefined;
        this.setFree();
    };
    return TextureAtlasAllocatorRect;
}());
//# sourceMappingURL=TextureAtlas.js.map