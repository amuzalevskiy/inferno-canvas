"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnimationFrameHandler = /** @class */ (function () {
    function AnimationFrameHandler(registry, enableTimeReport) {
        var _this = this;
        this._counter = 0;
        this._indexToCbMap = new Map();
        this._cycling = false;
        this._queued = false;
        this._views = [];
        this._callbacks = [];
        this.avgCycleTimeSpent = 0;
        this.avgRenderCycleTimeSpent = 0;
        this._process = function () {
            var cycleStart = performance.now();
            _this._queued = false;
            _this._cycling = true;
            var callbacks = _this._callbacks;
            _this._callbacks = [];
            _this._indexToCbMap.clear();
            // call before rendering
            for (var i = 0; i < callbacks.length; i++) {
                var cb = callbacks[i];
                cb(cycleStart);
            }
            var renderingStart = performance.now();
            // render all dirty views
            for (var j = 0; j < _this._views.length; j++) {
                var canvasView = _this._views[j];
                if (canvasView.doc.dirty) {
                    canvasView.render();
                    canvasView.bindEventHandlers();
                    canvasView.doc.dirty = false;
                }
            }
            // remove unused nodes from yoga-layout
            _this.registry.cleanup();
            _this._cycling = false;
            if (_this._queued) {
                requestAnimationFrame(_this._process);
            }
            var endTime = performance.now();
            var timeSpent = endTime - cycleStart;
            _this.avgCycleTimeSpent = _this.avgCycleTimeSpent * 0.995 + timeSpent * 0.005;
            var renderingTimeSpent = endTime - renderingStart;
            _this.avgRenderCycleTimeSpent = _this.avgRenderCycleTimeSpent * 0.995 + renderingTimeSpent * 0.005;
        };
        this.registry = registry;
        if (enableTimeReport) {
            setInterval(function () {
                console.log("CYCLE: full: " + _this.avgCycleTimeSpent.toFixed(1) + "ms, render: " + _this.avgRenderCycleTimeSpent.toFixed(1) + "ms (" + (_this.avgRenderCycleTimeSpent / _this.avgCycleTimeSpent * 100).toFixed(0) + "%)");
            }, 2000);
        }
    }
    AnimationFrameHandler.prototype._addView = function (view) {
        this._views.push(view);
    };
    AnimationFrameHandler.prototype._removeView = function (view) {
        var index = this._views.indexOf(view);
        if (index !== -1) {
            this._views.splice(index, 1);
        }
    };
    AnimationFrameHandler.prototype._checkEnqueued = function () {
        if (!this._queued) {
            this._queued = true;
            // micro op:  5% - 10% spent on waiting for requestAnimationFrame
            // requestAnimationFrame will happen later at the end of processing cycle
            if (!this._cycling) {
                requestAnimationFrame(this._process);
            }
        }
    };
    AnimationFrameHandler.prototype._pushCb = function (cb) {
        var index = this._counter++;
        this._indexToCbMap.set(index, cb);
        this._callbacks.push(cb);
        return index;
    };
    AnimationFrameHandler.prototype._removeCb = function (index) {
        var cb = this._indexToCbMap.get(index);
        if (!cb) {
            return;
        }
        this._callbacks.splice(this._callbacks.indexOf(cb), 1);
        this._indexToCbMap.delete(index);
    };
    return AnimationFrameHandler;
}());
exports.AnimationFrameHandler = AnimationFrameHandler;
//# sourceMappingURL=AnimationFrameHandler.js.map