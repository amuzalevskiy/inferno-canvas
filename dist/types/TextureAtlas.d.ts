import { BasketsCache } from './BasketsCache';
import { IRect } from './node';
interface ImgSourceAndRegion extends IRect {
    source: HTMLCanvasElement | HTMLImageElement;
}
/**
 * Caches images of exact size on offscreen canvas
 *
 * This prevents
 */
export declare class TextureAtlas {
    canvas: HTMLCanvasElement;
    context2d: CanvasRenderingContext2D;
    unusedSpace: number;
    cache: BasketsCache<string, ImgSourceAndRegion>;
    maxCachedTargetHeight: number;
    constructor(maxCachedTargetHeight?: number);
    resizeCanvas(width: number): void;
    getImage(img: HTMLImageElement, sourceRect: IRect, targetRect: IRect): ImgSourceAndRegion;
    getKey(img: HTMLImageElement, sourceBox: IRect, targetBox: IRect): string;
    cacheOnSeparateCanvas(key: string, img: HTMLImageElement, sourceRect: IRect, targetRect: IRect): ImgSourceAndRegion;
    emptySpaceStart: number;
    partiallyFreeRows: {
        [width: number]: {
            left: number;
            currentTop: number;
        };
    };
    cacheOnMainCanvas(key: string, img: HTMLImageElement, sourceRect: IRect, targetRect: IRect): ImgSourceAndRegion;
}
export {};
