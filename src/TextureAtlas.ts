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
export class TextureAtlas {
    canvas = document.createElement("canvas");
    context2d = this.canvas.getContext("2d")!;
    unusedSpace = 0;
    cache = new BasketsCache<string, ImgSourceAndRegion>({
        // don't keep image too long
        maxBaskets: 2,
        onRemove: (value: ImgSourceAndRegion, key: string) => {
            if (value.source !== this.canvas) {
                // nothing to do, as it is cached on separate canvas
                return;
            }
            this.unusedSpace += value.width * value.height;
        }
    });

    maxCachedTargetHeight: number;

    constructor(maxCachedTargetHeight: number = 256) {
        this.maxCachedTargetHeight = maxCachedTargetHeight;
        this.resizeCanvas(512);
    }

    resizeCanvas(width: number) {
        this.canvas.width = width;
        this.canvas.height = this.maxCachedTargetHeight;
    }

    getImage(img: HTMLImageElement, sourceRect: IRect, targetRect: IRect): ImgSourceAndRegion {
        let key = this.getKey(img, sourceRect, targetRect);
        let result = this.cache.get(key);
        if (!result) {
            if (targetRect.height > this.maxCachedTargetHeight) {
                if (sourceRect.width === targetRect.width && sourceRect.height === targetRect.height) {
                    // no resizing, so no need to cache resize result
                    return {
                        source: img,
                        ...sourceRect
                    };
                }
                // cache on separate canvas
                result = this.cacheOnSeparateCanvas(key, img, sourceRect, targetRect);
            } else {
                result = this.cacheOnMainCanvas(key, img, sourceRect, targetRect);    
            }
        }
        return result;
    }

    getKey(img: HTMLImageElement, sourceBox: IRect, targetBox: IRect): string {
        return img.id + 't' +
            ((targetBox.width << 13 + targetBox.height) * 67108864/* 2 ^ 26 */ + (sourceBox.width << 13 + sourceBox.height)) +
            "s" + (sourceBox.top << 13 + sourceBox.left);
    }

    cacheOnSeparateCanvas(key: string, img: HTMLImageElement, sourceRect: IRect, targetRect: IRect): ImgSourceAndRegion {
        const canvas = document.createElement("canvas");
        canvas.width = targetRect.width;
        canvas.height = targetRect.height;
        canvas.getContext("2d")!.drawImage(
            img,
            sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height,
            0, 0, targetRect.width, targetRect.height
        );
        let result = {
            source: canvas,
            top: 0,
            left: 0,
            width: targetRect.width,
            height: targetRect.height
        };
        this.cache.set(key, result);
        return result;
    }

    emptySpaceStart = 0;
    partiallyFreeRows: {
        [width: number]: {
            left: number;
            currentTop: number;
        }
    } = {};

    cacheOnMainCanvas(key: string, img: HTMLImageElement, sourceRect: IRect, targetRect: IRect): ImgSourceAndRegion {
        let maybeRow = this.partiallyFreeRows[targetRect.width];
        if (!maybeRow) {
            this.partiallyFreeRows[targetRect.width] = maybeRow = {
                left: this.emptySpaceStart,
                currentTop: 0
            };
            this.emptySpaceStart += targetRect.width;
        }
        let freeSpace = this.maxCachedTargetHeight - maybeRow.currentTop;
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

        this.context2d.drawImage(
            img,
            sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height,
            maybeRow.left, maybeRow.currentTop, targetRect.width, targetRect.height
        );
        let result = {
            source: this.canvas,
            top: maybeRow.currentTop,
            left: maybeRow.left,
            width: targetRect.width,
            height: targetRect.height
        };
        maybeRow.currentTop += targetRect.height;

        this.cache.set(key, result);

        return result;
    }
}