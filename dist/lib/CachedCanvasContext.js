"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CachedCanvasContext = /** @class */ (function () {
    function CachedCanvasContext(parent, context) {
        this.font = parent.font;
        this.fillStyle = parent.fillStyle;
        this.textAlign = parent.textAlign;
        this.textBaseline = parent.textBaseline;
        this.context = context;
        this.parent = parent instanceof CachedCanvasContext ? parent : undefined;
    }
    CachedCanvasContext.prototype.createNestedContext = function () {
        return new CachedCanvasContext(this, this.context);
    };
    CachedCanvasContext.prototype.getParentContext = function () {
        return this.parent === undefined ? this : this.parent;
    };
    CachedCanvasContext.prototype.setFont = function (font) {
        if (font !== this.font) {
            this.font = font;
            this.context.font = font;
        }
    };
    CachedCanvasContext.prototype.setFillStyle = function (fillStyle) {
        if (fillStyle !== this.fillStyle) {
            this.fillStyle = fillStyle;
            this.context.fillStyle = fillStyle;
        }
    };
    CachedCanvasContext.prototype.setTextAlign = function (textAlign) {
        if (textAlign !== this.textAlign) {
            this.textAlign = textAlign;
            this.context.textAlign = textAlign;
        }
    };
    CachedCanvasContext.prototype.setTextBaseline = function (textBaseline) {
        if (textBaseline !== this.textBaseline) {
            this.textBaseline = textBaseline;
            this.context.textBaseline = textBaseline;
        }
    };
    return CachedCanvasContext;
}());
exports.CachedCanvasContext = CachedCanvasContext;
//# sourceMappingURL=CachedCanvasContext.js.map