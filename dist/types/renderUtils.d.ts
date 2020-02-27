import { CachedCanvasContext } from "./CachedCanvasContext";
export declare const TEXT_ALIGN_LEFT = 0;
export declare const TEXT_ALIGN_CENTER = 1;
export declare const TEXT_ALIGN_RIGHT = 2;
export declare type TEXT_ALIGN = typeof TEXT_ALIGN_LEFT | typeof TEXT_ALIGN_RIGHT | typeof TEXT_ALIGN_CENTER;
export declare const VERTICAL_ALIGN_TOP = 0;
export declare const VERTICAL_ALIGN_MIDDLE = 1;
export declare const VERTICAL_ALIGN_BOTTOM = 2;
export declare type VERTICAL_ALIGN = typeof VERTICAL_ALIGN_TOP | typeof VERTICAL_ALIGN_MIDDLE | typeof VERTICAL_ALIGN_BOTTOM;
export declare function renderText(ctx: CanvasRenderingContext2D, cachedContext: CachedCanvasContext, text: string, left: number, top: number, width: number, height: number, textAlign?: TEXT_ALIGN, verticalAlign?: VERTICAL_ALIGN, ellipsisChar?: string, cacheNode?: {
    cache?: {
        text: string;
        width: number;
        value: string;
    };
}): void;
export declare function measureText(font: string, content: string): {
    width: number;
};
export declare function countLines(text: string, font: string, maxWidth: number, maxLines: number): number;
export declare function renderMultilineText(ctx: CanvasRenderingContext2D, cachedContext: CachedCanvasContext, text: string, left: number, top: number, width: number, height: number, lineHeight: number, textAlign?: TEXT_ALIGN, verticalAlign?: VERTICAL_ALIGN, maxLines?: number, ellipsisChar?: string): void;
export declare function outerBorderPath(ctx: CanvasRenderingContext2D, borderRadius: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number, preferMove: boolean): void;
export declare function createBorderPath(ctx: CanvasRenderingContext2D, borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number): void;
export declare function closedInnerBorderPath(ctx: CanvasRenderingContext2D, borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number): void;
