import { Component, setCreateElementFunction, render } from 'inferno';
import { createElement } from 'inferno-create-element';
import { CanvasElement } from './CanvasElement';
import { IStyleProps, IStyleDefinition } from "./node";
import { parseStyle } from './parseStyle';
import { CanvasView } from './CanvasView';
import { CanvasDocument } from './CanvasDocument';
import { AnimationFrameHandler } from './AnimationFrameHandler';

setCreateElementFunction(function (type: string) {
  return new CanvasElement(type);
});

declare global { 
  namespace JSX {
    interface IntrinsicElements {
      v: {
        style?: IStyleProps;
        key?: number|string;
        children?: any;
        onClick?: () => any,
        onDblClick?: () => any,
        onMouseDown?: () => any,
        onMouseMove?: () => any,
        onMouseUp?: () => any,
        onMouseEnter?: () => any,
        onMouseLeave?: () => any
      };
      t: {
        style?: IStyleProps;
        key?: number|string;
        content?: string;
        onClick?: () => any,
        onDblClick?: () => any,
        onMouseDown?: () => any,
        onMouseMove?: () => any,
        onMouseUp?: () => any,
        onMouseEnter?: () => any,
        onMouseLeave?: () => any
      };
    }
  }
}

export let animationFrameHandler = new AnimationFrameHandler();

// plans any function before next render
function _requestAnimationFrame(cb: (time: number) => void) {
  animationFrameHandler._checkEnqueued();
  return animationFrameHandler._pushCb(cb);
}
function _cancelAnimationFrame(id: number) {
  animationFrameHandler._removeCb(id);
}

function mount(component: JSX.Element, canvas: HTMLCanvasElement, left: number, top: number, width: number, height: number) {
  animationFrameHandler._checkEnqueued();
  if ((canvas as any)["canvasView"]) {
    let canvasView = (canvas as any)["canvasView"];
    let canvasDOM = (canvas as any)["canvasDOM"];
    canvasDOM.style.setProperty("width", width);
    canvasDOM.style.setProperty("height", height);
    canvasView.setTargetRegion(left, top, width, height);
    render(component, canvasDOM);
    canvasView.render();
    return;
  }
  
  let canvasDOM = new CanvasElement("root");
  canvasDOM.style.setProperty("width", width);
  canvasDOM.style.setProperty("height", height);

  let canvasView = new CanvasView(canvas, canvasDOM, left, top, width, height);
  animationFrameHandler._addView(canvasView);

  (canvas as any)["canvasView"] = canvasView;
  (canvas as any)["canvasDOM"] = canvasDOM;
  const canvasDoc = new CanvasDocument(animationFrameHandler);
  canvasDOM._setDoc(canvasDoc);
  canvasView._setDoc(canvasDoc);
  render(component, canvasDOM as any);
  canvasView.render();
  canvasView.bindEventHandlers();
  
  return canvasDoc;
}

function unmount(canvas: HTMLCanvasElement) {
  if (!(canvas as any)["canvasView"]) {
    return;
  }
  let canvasView = (canvas as any)["canvasView"];
  let canvasDOM = (canvas as any)["canvasDOM"];
  
  animationFrameHandler._removeView(canvasView);
  render(null, canvasDOM);

  canvasView.destroy();
  canvasDOM.free();

  delete (canvas as any)["canvasView"];
  delete (canvas as any)["canvasDOM"];
}

export {
  mount,
  unmount,
  _requestAnimationFrame as requestAnimationFrame,
  _cancelAnimationFrame as cancelAnimationFrame,
  Component,
  createElement,
  parseStyle,
  IStyleProps,
  IStyleDefinition
};