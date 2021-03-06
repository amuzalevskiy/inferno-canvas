import {ICache} from "./ICache";
import {BasketsCache, IBasketsCacheOptions} from "./BasketsCache";
import {imageLoader} from "./imageLoader";

export class ImageCacheEntry {
    readonly image: HTMLImageElement;
    readonly width: number;
    readonly height: number;
    constructor(image: HTMLImageElement) {
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }
}

export class ImageCache<CacheImpl extends ICache<string, ImageCacheEntry|Error>>{
    private requests: Map<string, Promise<HTMLImageElement>> = new Map();
    private cache: CacheImpl;
    public static createBasketsImageCache(options: IBasketsCacheOptions<string, ImageCacheEntry|Error>): ImageCache<BasketsCache<string, ImageCacheEntry|Error>> {
        return new ImageCache(new BasketsCache<string, ImageCacheEntry|Error>(options));
    }
    constructor(cache: CacheImpl) {
        this.cache = cache;
    }
    get(url: string): ImageCacheEntry | Error | Promise<HTMLImageElement> {
        if (this.cache.has(url)) {
            return this.cache.get(url)!;
        }
        if (!this.requests.has(url)) {
            this.requests.set(url, imageLoader.prefetch(url).then((img: HTMLImageElement) => {
                this.cache.set(url, new ImageCacheEntry(img));
                this.requests.delete(url);
                return img;
            }, (e) => {
                this.cache.set(url, new Error("File not found: " + url));
                this.requests.delete(url);
                throw e;
            }));
        }
        return this.requests.get(url)!;
    }
}
