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
export declare class TextureAtlasImageCache {
    private imageCache;
    private atlas;
    private context2d;
    constructor(atlas: TextureAtlas, imageCache: ImageCache<ICache<string, ImageCacheEntry | Error>>);
    private cache;
    getImage(uri: string, sourceRect: IRect, targetRect: IRect): TextureAtlasRegion | Promise<HTMLImageElement> | Error;
    private getKey;
    private cacheOnMainCanvas;
}
