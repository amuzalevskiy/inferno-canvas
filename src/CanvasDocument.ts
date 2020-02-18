import { AnimationFrameHandler } from './AnimationFrameHandler';

export class CanvasDocument {
  eventCounter: {
    [eventName: string]: number;
  } = {};
  
  dirty = false;

  readonly animationFrameHandler: AnimationFrameHandler;

  constructor(animationFrameHandler: AnimationFrameHandler) {
    this.animationFrameHandler = animationFrameHandler;
  }
  markDirty() {
    if (!this.dirty) {
      this.dirty = true;
      this.animationFrameHandler._checkEnqueued();
    }
  }
  addEvent(name: string) {
    if (!this.eventCounter[name]) {
      this.eventCounter[name] = 0;
    }
    this.eventCounter[name]++;
  }
  removeEvent(name: string) {
    this.eventCounter[name]--;
  }
}
