"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CanvasDocument = /** @class */ (function () {
    function CanvasDocument(animationFrameHandler) {
        this.eventCounter = {};
        this.dirty = false;
        this.animationFrameHandler = animationFrameHandler;
    }
    CanvasDocument.prototype.markDirty = function () {
        if (!this.dirty) {
            this.dirty = true;
            this.animationFrameHandler._checkEnqueued();
        }
    };
    CanvasDocument.prototype.addEvent = function (name) {
        if (!this.eventCounter[name]) {
            this.eventCounter[name] = 0;
        }
        this.eventCounter[name]++;
    };
    CanvasDocument.prototype.removeEvent = function (name) {
        this.eventCounter[name]--;
    };
    return CanvasDocument;
}());
exports.CanvasDocument = CanvasDocument;
//# sourceMappingURL=CanvasDocument.js.map