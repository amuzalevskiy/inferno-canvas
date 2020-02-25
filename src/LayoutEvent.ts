import { ILayoutNode } from "./node";

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

export function bubbleEvent(e: Event, type: string, node: ILayoutNode) {
  let event = new LayoutEvent(e, type, node);
  let current: ILayoutNode|undefined = node;
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

export class LayoutEvent {
  originalEvent: Event;
  cancelBubble: boolean = false;
  readonly target: ILayoutNode;
  currentTarget: ILayoutNode;
  readonly type: string;
  constructor(
    originalEvent: Event,
    type: string,
    target: ILayoutNode,
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
