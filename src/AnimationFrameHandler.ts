import { CanvasView } from './CanvasView';
import { CanvasElementRegistry } from './CanvasElementRegistry';
type RafCallback = (now: number) => void;

export class AnimationFrameHandler {
  private _counter = 0;
  private _indexToCbMap = new Map<number, RafCallback>()
  private _cycling = false;
  private _queued = false;
  private _views: CanvasView[] = [];
  private _callbacks: RafCallback[] = [];
  private avgCycleTimeSpent = 0;
  private avgRenderCycleTimeSpent = 0;
  private readonly registry: CanvasElementRegistry;
  constructor(registry: CanvasElementRegistry, enableTimeReport: boolean) {
    this.registry = registry;
    if (enableTimeReport) {
      setInterval(() => {
        console.log("CYCLE: full: " + this.avgCycleTimeSpent.toFixed(1) + "ms, render: " + this.avgRenderCycleTimeSpent.toFixed(1) + "ms (" + (this.avgRenderCycleTimeSpent / this.avgCycleTimeSpent * 100).toFixed(0) + "%)");
      }, 2000);
    }
  }

  _addView(view: CanvasView) {
    this._views.push(view);
  }
  _removeView(view: CanvasView) {
    let index = this._views.indexOf(view);
    if (index !== -1) {
      this._views.splice(index, 1);
    }
  }
  _checkEnqueued() {
    if (!this._queued) {
      this._queued = true;
      // micro op:  5% - 10% spent on waiting for requestAnimationFrame
      // requestAnimationFrame will happen later at the end of processing cycle
      if (!this._cycling) {
        requestAnimationFrame(this._process);
      }
    }
  }

  _pushCb(cb: RafCallback) {
    let index = this._counter++;
    this._indexToCbMap.set(index, cb);
    this._callbacks.push(cb);
    return index;
  }

  _removeCb(index: number) {
    let cb = this._indexToCbMap.get(index);
    if (!cb) {
      return;
    }
    this._callbacks.splice(this._callbacks.indexOf(cb), 1);
    this._indexToCbMap.delete(index);
  }
  
  _process = () => {
    let cycleStart = performance.now();
    this._queued = false;
    this._cycling = true;
    let callbacks = this._callbacks;
    this._callbacks = [];
    this._indexToCbMap.clear();

    // call before rendering
    for (let i = 0; i < callbacks.length; i++) {
      const cb = callbacks[i];
      cb(cycleStart);
    }

    let renderingStart = performance.now();

    // render all dirty views
    for (let j = 0; j < this._views.length; j++) {
      const canvasView = this._views[j];
      if (canvasView.doc.dirty) {
        canvasView.render();
        canvasView.bindEventHandlers();
        canvasView.doc.dirty = false;
      }
    }
    
    // remove unused nodes from yoga-layout
    this.registry.cleanup();

    this._cycling = false;

    if (this._queued) {
      requestAnimationFrame(this._process);
    }
    let endTime = performance.now();
    let timeSpent = endTime - cycleStart;
    this.avgCycleTimeSpent = this.avgCycleTimeSpent * 0.995 + timeSpent * 0.005;
    let renderingTimeSpent = endTime - renderingStart;
    this.avgRenderCycleTimeSpent = this.avgRenderCycleTimeSpent * 0.995 + renderingTimeSpent * 0.005;
  }
}
