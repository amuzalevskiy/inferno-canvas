import { BasketsCache } from './BasketsCache';
import { IRect } from './node';
import { TextureAtlasRegion, TextureAtlas } from './TextureAtlas';
import { ICache } from './ICache';
import { ImageCache, ImageCacheEntry } from './ImageCache';

/**
 * Caches images of exact size on offscreen canvas
 * also used to cache prerendered views
 * 
 * The goal is to minimize context switches
 * data from single canvas are copied to main canvas
 */
export class TextureAtlasImageCache {
    private imageCache: ImageCache<ICache<string, ImageCacheEntry | Error>>;
    private atlas: TextureAtlas;
    private context2d: CanvasRenderingContext2D;
    constructor(atlas: TextureAtlas, imageCache: ImageCache<ICache<string, ImageCacheEntry | Error>>) {
        this.atlas = atlas;
        this.imageCache = imageCache;
        this.context2d = this.atlas.context2d;
    }
    private cache = new BasketsCache<string, TextureAtlasRegion | Error>({
        // don't keep image too long
        maxBaskets: 3,
        basketLifetime: 2500,
        onRemove: (value: TextureAtlasRegion | Error, key: string) => {
            if (value instanceof TextureAtlasRegion) {
                value.setFree();
            }
        },
    });

    getImage(uri: string, sourceRect: IRect, targetRect: IRect): TextureAtlasRegion | Promise<HTMLImageElement> | Error {
        let key = this.getKey(uri, sourceRect, targetRect);
        let result: TextureAtlasRegion | Promise<HTMLImageElement> | Error | undefined = this.cache.get(key);
        if (!result) {
            result = this.cacheOnMainCanvas(key, uri, sourceRect, targetRect);
        }
        return result;
    }

    private getKey(uri: string, sourceBox: IRect, targetBox: IRect): string {
        return uri + 't' +
            ((targetBox.width << 13 + targetBox.height) * 67108864/* 2 ^ 26 */ + (sourceBox.width << 13 + sourceBox.height)) +
            "s" + (sourceBox.top << 13 + sourceBox.left);
    }

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

    private cacheOnMainCanvas(key: string, uri: string, sourceRect: IRect, targetRect: IRect): TextureAtlasRegion | Promise<HTMLImageElement> | Error {
        var imgMaybe = this.imageCache.get(uri);
        if (imgMaybe instanceof ImageCacheEntry) {
            // locate place
            let region = this.atlas.allocate(targetRect.width, targetRect.height);
            // draw on canvas
            this.context2d.clearRect(region.left, region.top, region.width, region.height);
            this.context2d.drawImage(
                imgMaybe.image,
                sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height,
                region.left, region.top, region.width, region.height
            );
            this.cache.set(key, region);
            return region;
        } else if (imgMaybe instanceof Error) {
            this.cache.set(key, imgMaybe);
            return imgMaybe;
        }
        return imgMaybe;
    }
}
