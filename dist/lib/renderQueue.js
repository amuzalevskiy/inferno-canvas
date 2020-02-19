"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var map = new Map();
var queue = [];
var animationFrameRequested = false;
function renderAll() {
    for (var i = 0; i < queue.length; i += 1) {
        queue[i].render();
    }
    queue = [];
    animationFrameRequested = false;
}
exports.renderQueue = {
    enqueue: function (renderable) {
        if (queue.indexOf(renderable) !== -1) {
            return;
        }
        queue.push(renderable);
        if (!animationFrameRequested) {
            requestAnimationFrame(renderAll);
            animationFrameRequested = true;
        }
    },
    renderAfter: function (renderable, promise) {
        var _this = this;
        var linked = map.get(promise);
        if (!linked) {
            linked = [];
            map.set(promise, linked);
        }
        if (linked.length === 0) {
            // plan rendering
            promise.then(function () {
                for (var i = 0; i < linked.length; i += 1) {
                    _this.enqueue(linked[i]);
                }
                map.delete(promise);
            }, function () {
                // nothing to render
                // for now there is no fallback supported
                // so just skip
                map.delete(promise);
            });
        }
        if (linked.indexOf(renderable) !== -1) {
            // already linked
            return;
        }
        linked.push(renderable);
    }
};
//# sourceMappingURL=renderQueue.js.map