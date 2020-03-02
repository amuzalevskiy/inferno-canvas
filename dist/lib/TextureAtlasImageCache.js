"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BasketsCache_1 = require("./BasketsCache");
var TextureAtlas_1 = require("./TextureAtlas");
var ImageCache_1 = require("./ImageCache");
/**
 * Caches images of exact size on offscreen canvas
 * also used to cache prerendered views
 *
 * The goal is to minimize context switches
 * data from single canvas are copied to main canvas
 */
var TextureAtlasImageCache = /** @class */ (function () {
    function TextureAtlasImageCache(atlas, imageCache) {
        this.cache = new BasketsCache_1.BasketsCache({
            // don't keep image too long
            maxBaskets: 3,
            basketLifetime: 2500,
            onRemove: function (value, key) {
                if (value instanceof TextureAtlas_1.TextureAtlasRegion) {
                    value.setFree();
                }
            },
        });
        this.atlas = atlas;
        this.imageCache = imageCache;
        this.context2d = this.atlas.context2d;
    }
    TextureAtlasImageCache.prototype.getImage = function (uri, sourceRect, targetRect) {
        var key = this.getKey(uri, sourceRect, targetRect);
        var result = this.cache.get(key);
        if (!result) {
            result = this.cacheOnMainCanvas(key, uri, sourceRect, targetRect);
        }
        return result;
    };
    TextureAtlasImageCache.prototype.getKey = function (uri, sourceBox, targetBox) {
        return uri + 't' +
            ((targetBox.width << 13 + targetBox.height) * 67108864 /* 2 ^ 26 */ + (sourceBox.width << 13 + sourceBox.height)) +
            "s" + (sourceBox.top << 13 + sourceBox.left);
    };
    // unused temporary...
    // cacheOnSeparateCanvas(key: string, img: HTMLImageElement, sourceRect: IRect, targetRect: IRect): ImgSourceAndRegion {
    //     const canvas = document.createElement("canvas");
    //     canvas.width = targetRect.width;
    //     canvas.height = targetRect.height;
    //     canvas.getContext("2d")!.drawImage(
    //         img,
    //         sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height,
    //         0, 0, targetRect.width, targetRect.height
    //     );
    //     let result = {
    //         source: canvas,
    //         top: 0,
    //         left: 0,
    //         width: targetRect.width,
    //         height: targetRect.height
    //     };
    //     this.cache.set(key, result);
    //     return result;
    // }
    TextureAtlasImageCache.prototype.cacheOnMainCanvas = function (key, uri, sourceRect, targetRect) {
        var imgMaybe = this.imageCache.get(uri);
        if (imgMaybe instanceof ImageCache_1.ImageCacheEntry) {
            // locate place
            var region = this.atlas.allocate(targetRect.width, targetRect.height);
            // draw on canvas
            this.context2d.clearRect(region.left, region.top, region.width, region.height);
            this.context2d.drawImage(imgMaybe.image, sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height, region.left, region.top, region.width, region.height);
            this.cache.set(key, region);
            return region;
        }
        else if (imgMaybe instanceof Error) {
            this.cache.set(key, imgMaybe);
            return imgMaybe;
        }
        return imgMaybe;
    };
    return TextureAtlasImageCache;
}());
exports.TextureAtlasImageCache = TextureAtlasImageCache;
//# sourceMappingURL=TextureAtlasImageCache.js.map