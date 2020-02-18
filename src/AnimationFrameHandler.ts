import { CanvasView } from './CanvasView';
type RafCallback = (now: number) => void;
export class AnimationFrameHandler {
  private _counter = 0;
  private _indexToCbMap = new Map<number, RafCallback>()
  private _cycling = false;
  private _queued = false;
  private _views: CanvasView[] = [];
  private _callbacks: RafCallback[] = [];
  private avgCycleTimeSpent = 0;

  constructor() {
    setInterval(() => {
      console.log("avg cycle time: " + this.avgCycleTimeSpent.toFixed(1) + 'ms');
    }, 2000);
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
    let now = performance.now();
    this._queued = false;
    this._cycling = true;
    let callbacks = this._callbacks;
    this._callbacks = [];
    this._indexToCbMap.clear();

    // call before rendering
    for (let i = 0; i < callbacks.length; i++) {
      const cb = callbacks[i];
      cb(now);
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
    this._cycling = false;
    if (this._queued) {
      requestAnimationFrame(this._process);
    }
    let timeSpent = performance.now() - now;
    this.avgCycleTimeSpent = this.avgCycleTimeSpent * 0.99 + timeSpent * 0.01;
  }
}
