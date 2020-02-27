declare type CanvasTextAlign = "start" | "end" | "left" | "right" | "center";
declare type CanvasTextBaseline = "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";
export declare class CachedCanvasContext {
    font: string;
    fillStyle: string | CanvasGradient | CanvasPattern;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    context: CanvasRenderingContext2D;
    private parent?;
    constructor(parent: CachedCanvasContext | CanvasRenderingContext2D, context: CanvasRenderingContext2D);
    createNestedContext(): CachedCanvasContext;
    getParentContext(): CachedCanvasContext;
    setFont(font: string): void;
    setFillStyle(fillStyle: string | CanvasGradient | CanvasPattern): void;
    setTextAlign(textAlign: CanvasTextAlign): void;
    setTextBaseline(textBaseline: CanvasTextBaseline): void;
}
export {};
