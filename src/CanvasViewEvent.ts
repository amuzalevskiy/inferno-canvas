import { ILayoutNode } from "./node";
import { CanvasElement } from "./CanvasElement";

export const mapEventType = {
  click: 1,
  mousedown: 1,
  mousemove: 1,
  mouseup: 1
  /*
      mouseenter: 'onMouseEnter',
      mouseleave: 'onMouseLeave',
      mouseout: 'onMouseOut',
      mouseover: 'onMouseOver',
  */
};

export function bubbleEvent(e: Event, type: string, node: CanvasElement) {
  let event = new CanvasViewEvent(e, type, node);
  let current: CanvasElement|undefined = node;
  while (current) {
    if (current.$EV && current.$EV[type]) {
      event.currentTarget = current;
      current.$EV[type].call(current, event);
      if (event.cancelBubble) {
        return;
      }
    }
    current = current.parentNode;
  }
}

export class CanvasViewEvent {
  originalEvent: Event;
  cancelBubble: boolean = false;
  readonly target: CanvasElement;
  currentTarget: CanvasElement;
  readonly type: string;
  constructor(
    originalEvent: Event,
    type: string,
    target: CanvasElement,
    bubbles: boolean = true
  ) {
    this.originalEvent = originalEvent;
    this.target = target;
    this.currentTarget = target;
    this.type = type || originalEvent.type;
    this.cancelBubble = !bubbles;
  }
  stopPropagation() {
    this.cancelBubble = true;
  }
  get defaultPrevented() {
    return this.originalEvent.defaultPrevented;
  }
  preventDefault() {
    this.originalEvent.preventDefault();
  }
}
