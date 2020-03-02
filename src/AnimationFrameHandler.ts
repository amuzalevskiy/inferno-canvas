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
  private avgCycleTimeSpent = 0.0001; // should never eq 0
  private avgReactTimeSpent = 0;
  private avgRenderCycleTimeSpent = 0;
  private readonly registry: CanvasElementRegistry;
  private enableTimeReport: boolean;
  constructor(registry: CanvasElementRegistry, enableTimeReport: boolean) {
    this.registry = registry;
    this.enableTimeReport = enableTimeReport;
    if (enableTimeReport) {
      setInterval(() => {
        console.log("CYCLE: full: " + this.avgCycleTimeSpent.toFixed(1) + "ms, react: " + this.avgReactTimeSpent.toFixed(1) + "ms (" + (this.avgReactTimeSpent / this.avgCycleTimeSpent * 100).toFixed(0) + "%), render: " + this.avgRenderCycleTimeSpent.toFixed(1) + "ms (" + (this.avgRenderCycleTimeSpent / this.avgCycleTimeSpent * 100).toFixed(0) + "%)");
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
  
  _process = (frameStart: number) => {
    let cycleStart: number = 0;
    if (this.enableTimeReport) {
      cycleStart = performance.now()
    }
    this._queued = false;
    this._cycling = true;
    let callbacks = this._callbacks;
    this._callbacks = [];
    this._indexToCbMap.clear();

    // call before rendering
    for (let i = 0; i < callbacks.length; i++) {
      const cb = callbacks[i];
      cb(frameStart);
    }

    let renderingStart: number = 0;
    if (this.enableTimeReport) {
      renderingStart = performance.now();
    }

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
    if (this.enableTimeReport) {
      let endTime = performance.now();
      let timeSpent = endTime - frameStart;
      if (this.avgCycleTimeSpent > timeSpent) {
        // cold slow
        this.avgCycleTimeSpent = this.avgCycleTimeSpent * 0.995 + timeSpent * 0.005;
      } else {
        // heat fast
        this.avgCycleTimeSpent = this.avgCycleTimeSpent * 0.9 + timeSpent * 0.1;
      }
      
      let reactTimeSpent = renderingStart - cycleStart;
      if (this.avgReactTimeSpent > reactTimeSpent) {
        // cold slow
        this.avgReactTimeSpent = this.avgReactTimeSpent * 0.995 + reactTimeSpent * 0.005;
      } else {
        // heat fast
        this.avgReactTimeSpent = this.avgReactTimeSpent * 0.9 + reactTimeSpent * 0.1;
      }

      let renderingTimeSpent = endTime - renderingStart;
      if (this.avgRenderCycleTimeSpent > renderingTimeSpent) {
        // cold slow
        this.avgRenderCycleTimeSpent = this.avgRenderCycleTimeSpent * 0.995 + renderingTimeSpent * 0.005;
      } else {
        // heat fast
        this.avgRenderCycleTimeSpent = this.avgRenderCycleTimeSpent * 0.9 + renderingTimeSpent * 0.1;
      }
    }
  }
}
