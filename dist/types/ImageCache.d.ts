import { ICache } from "./ICache";
import { BasketsCache, IBasketsCacheOptions } from "./BasketsCache";
export declare class ImageCache<CacheImpl extends ICache<string, HTMLImageElement | Error>> {
    private requests;
    private cache;
    static createBasketsImageCache(options: IBasketsCacheOptions<string, HTMLImageElement | Error>): ImageCache<BasketsCache<string, HTMLImageElement | Error>>;
    constructor(cache: CacheImpl);
    get(url: string): HTMLImageElement | Error | Promise<HTMLImageElement>;
}
