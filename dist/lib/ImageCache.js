"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BasketsCache_1 = require("./BasketsCache");
var imageLoader_1 = require("./imageLoader");
var ImageCacheEntry = /** @class */ (function () {
    function ImageCacheEntry(image) {
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }
    return ImageCacheEntry;
}());
exports.ImageCacheEntry = ImageCacheEntry;
var ImageCache = /** @class */ (function () {
    function ImageCache(cache) {
        this.requests = new Map();
        this.cache = cache;
    }
    ImageCache.createBasketsImageCache = function (options) {
        return new ImageCache(new BasketsCache_1.BasketsCache(options));
    };
    ImageCache.prototype.get = function (url) {
        var _this = this;
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }
        if (!this.requests.has(url)) {
            this.requests.set(url, imageLoader_1.imageLoader.prefetch(url).then(function (img) {
                _this.cache.set(url, new ImageCacheEntry(img));
                _this.requests.delete(url);
                return img;
            }, function (e) {
                _this.cache.set(url, new Error("File not found: " + url));
                _this.requests.delete(url);
                throw e;
            }));
        }
        return this.requests.get(url);
    };
    return ImageCache;
}());
exports.ImageCache = ImageCache;
//# sourceMappingURL=ImageCache.js.map