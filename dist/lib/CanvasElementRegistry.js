"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CanvasElementRegistry = /** @class */ (function () {
    function CanvasElementRegistry() {
        this.nodeCleanupQueue = new Map();
    }
    CanvasElementRegistry.prototype.removeNodeFromCleanupQueue = function (node) {
        this.nodeCleanupQueue.delete(node);
    };
    CanvasElementRegistry.prototype.addNodeToCleanupQueue = function (node) {
        this.nodeCleanupQueue.set(node, true);
    };
    CanvasElementRegistry.prototype.cleanup = function () {
        this.nodeCleanupQueue.forEach(function (_unused, node) {
            node.free();
        });
        this.nodeCleanupQueue = new Map();
    };
    return CanvasElementRegistry;
}());
exports.CanvasElementRegistry = CanvasElementRegistry;
//# sourceMappingURL=CanvasElementRegistry.js.map