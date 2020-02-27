export class CachedCanvasContext {
    public font: string;
    public fillStyle: string | CanvasGradient | CanvasPattern;
    public textAlign: string;
    public textBaseline: string;
    public context: CanvasRenderingContext2D;
    private parent?: CachedCanvasContext;
    constructor(parent: CachedCanvasContext | CanvasRenderingContext2D, context: CanvasRenderingContext2D) {
        this.font = parent.font;
        this.fillStyle = parent.fillStyle;
        this.textAlign = parent.textAlign;
        this.textBaseline = parent.textBaseline;
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
    
    setTextAlign(textAlign: string) {
        if (textAlign !== this.textAlign) {
            this.font = textAlign;
            this.context.font = textAlign;
        }
    }
    
    setTextBaseline(textBaseline: string) {
        if (textBaseline !== this.textBaseline) {
            this.textBaseline = textBaseline;
            this.context.font = textBaseline;
        }
    }
}