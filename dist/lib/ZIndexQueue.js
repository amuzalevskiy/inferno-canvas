"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ZIndexQueue = /** @class */ (function () {
    function ZIndexQueue() {
        this.empty = true;
    }
    ZIndexQueue.prototype.push = function (nodeRenderSpec) {
        var zIndex = nodeRenderSpec.node.style.zIndex ? nodeRenderSpec.node.style.zIndex : 0;
        this.getOrCreateQueue(zIndex).push(nodeRenderSpec);
    };
    ZIndexQueue.prototype.unshift = function (nodeRenderSpec) {
        var zIndex = nodeRenderSpec.node.style.zIndex ? nodeRenderSpec.node.style.zIndex : 0;
        this.getOrCreateQueue(zIndex).unshift(nodeRenderSpec);
    };
    ZIndexQueue.prototype.getOrCreateQueue = function (zIndex) {
        if (this.empty) {
            // optimal
            this.empty = false;
            // don't allocate Map until first push
            this.queue = new Map();
        }
        if (!this.queue.has(zIndex)) {
            this.queue.set(zIndex, []);
        }
        return this.queue.get(zIndex);
    };
    ZIndexQueue.prototype.render = function (view) {
        if (this.empty) {
            return;
        }
        var zIndexes = Array.from(this.queue.keys());
        zIndexes.sort();
        for (var i = 0; i < zIndexes.length; i += 1) {
            var zIndex = zIndexes[i];
            var renderSpecs = this.queue.get(zIndex);
            for (var j = 0; j < renderSpecs.length; j += 1) {
                var spec = renderSpecs[j];
                // all inner items has its own zIndex Queue
                view._addContext();
                view._renderNode(spec.node, spec.x, spec.y);
                view._currentQueue.render(view);
                view._removeContext();
            }
        }
    };
    ZIndexQueue.prototype.hitTest = function (offsetX, offsetY, view) {
        if (this.empty) {
            return;
        }
        var queue;
        var zIndexes = Array.from(this.queue.keys());
        zIndexes.sort();
        for (var i = zIndexes.length - 1; i >= 0; i--) {
            var zIndex = zIndexes[i];
            var renderSpecs = this.queue.get(zIndex);
            for (var j = renderSpecs.length - 1; j >= 0; j--) {
                var spec = renderSpecs[j];
                // all inner items has its own zIndex Queue
                queue = new ZIndexQueue();
                // must execute to fill ZIndexQueue
                var foundTarget = view._hitTest(offsetX, offsetY, spec.node, spec.x, spec.y, queue);
                var queueFoundTarget = queue.hitTest(offsetX, offsetY, view);
                return queueFoundTarget ? queueFoundTarget : foundTarget;
            }
        }
    };
    return ZIndexQueue;
}());
exports.ZIndexQueue = ZIndexQueue;
//# sourceMappingURL=ZIndexQueue.js.map