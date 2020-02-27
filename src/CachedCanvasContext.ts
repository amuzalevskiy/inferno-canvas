type CanvasTextAlign = "start" | "end" | "left" | "right" | "center";
type CanvasTextBaseline = "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";
export class CachedCanvasContext {
    public font: string;
    public fillStyle: string | CanvasGradient | CanvasPattern;
    public textAlign: CanvasTextAlign;
    public textBaseline: CanvasTextBaseline;
    public context: CanvasRenderingContext2D;
    private parent?: CachedCanvasContext;
    constructor(parent: CachedCanvasContext | CanvasRenderingContext2D, context: CanvasRenderingContext2D) {
        this.font = parent.font;
        this.fillStyle = parent.fillStyle;
        this.textAlign = parent.textAlign as unknown as CanvasTextAlign;
        this.textBaseline = parent.textBaseline as unknown as CanvasTextBaseline;
        this.context = context;
        this.parent = parent instanceof CachedCanvasContext ? parent : undefined;
    }

    createNestedContext() {
        return new CachedCanvasContext(this, this.context);
    }

    getParentContext() {
        return this.parent === undefined ? this : this.parent;
    }

    setFont(font: string) {
        if (font !== this.font) {
            this.font = font;
            this.context.font = font;
        }
    }
    
    setFillStyle(fillStyle: string | CanvasGradient | CanvasPattern) {
        if (fillStyle !== this.fillStyle) {
            this.fillStyle = fillStyle;
            this.context.fillStyle = fillStyle;
        }
    }
    
    setTextAlign(textAlign: CanvasTextAlign) {
        if (textAlign !== this.textAlign) {
            this.textAlign = textAlign;
            this.context.textAlign = textAlign;
        }
    }
    
    setTextBaseline(textBaseline: CanvasTextBaseline) {
        if (textBaseline !== this.textBaseline) {
            this.textBaseline = textBaseline;
            this.context.textBaseline = textBaseline;
        }
    }
}