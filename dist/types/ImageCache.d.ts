import { ICache } from "./ICache";
import { BasketsCache, IBasketsCacheOptions } from "./BasketsCache";
export declare class ImageCacheEntry {
    readonly image: HTMLImageElement;
    readonly width: number;
    readonly height: number;
    constructor(image: HTMLImageElement);
}
export declare class ImageCache<CacheImpl extends ICache<string, ImageCacheEntry | Error>> {
    private requests;
    private cache;
    static createBasketsImageCache(options: IBasketsCacheOptions<string, ImageCacheEntry | Error>): ImageCache<BasketsCache<string, ImageCacheEntry | Error>>;
    constructor(cache: CacheImpl);
    get(url: string): ImageCacheEntry | Error | Promise<HTMLImageElement>;
}
