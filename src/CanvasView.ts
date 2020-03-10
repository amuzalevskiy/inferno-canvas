import YogaLayout, {
  YogaDirection
} from "yoga-layout";

const {
  DIRECTION_LTR,
  OVERFLOW_HIDDEN,
  OVERFLOW_SCROLL,
  POSITION_TYPE_ABSOLUTE,
  EDGE_LEFT,
  EDGE_TOP,
  EDGE_RIGHT,
  EDGE_BOTTOM
} = YogaLayout;

import {
  renderText,
  renderMultilineText,
  closedInnerBorderPath,
  createBorderPath,
  outerBorderPath
} from "./renderUtils";

import { ImageCache, ImageCacheEntry } from "./ImageCache";
import { renderQueue } from "./renderQueue";
import {
  IRect,
  IStyleProps,
} from "./node";
import { ZIndexQueue } from "./ZIndexQueue";
import { CanvasViewEvent, bubbleEvent, mapEventType } from "./CanvasViewEvent";
import { CanvasElement } from "./CanvasElement";
import { TextureAtlasImageCache } from "./TextureAtlasImageCache";
import { CanvasDocument } from "./CanvasDocument";
import { CachedCanvasContext } from "./CachedCanvasContext";
import { TextureAtlas, TextureAtlasRegion } from "./TextureAtlas";
import { BasketsCache } from "./BasketsCache";

const ellipsis = String.fromCharCode(0x2026);

var imageCache = ImageCache.createBasketsImageCache({
  basketLifetime: 2500,
  maxBaskets: 3
});
var imageSizeCache = new BasketsCache<string, {width: number, height: number}>({
  // image size kept for a long time
  basketLifetime: 10000,
  maxBaskets: 3,
});
var textureAtlas = new TextureAtlas();
var textureAtlasImageCache = new TextureAtlasImageCache(textureAtlas, imageCache);

interface IListenersState {
  [eventName: string]: boolean;
}

function getAncestorsAndSelf(node: CanvasElement|undefined): Array<CanvasElement> {
  let ancestorsAndSelf = [];
  while (node) {
    ancestorsAndSelf.push(node);
    node = node.parentNode;
  }
  return ancestorsAndSelf;
}

function getImgBackgroundSourceRect(style: IStyleProps, targetRect: IRect, imgWidth: number, imgHeight: number) {
  let sourceBox: IRect;
  if (style.backgroundPositionX && style.backgroundPositionY) {
    sourceBox = {
      left: style.backgroundPositionX,
      top: style.backgroundPositionY,
      width: targetRect.width,
      height: targetRect.height,
    };
  }
  else {
    // emulate css background-size: contains
    var sourceAspect = imgWidth / imgHeight, targetAspect = targetRect.width / targetRect.height;
    if (sourceAspect < targetAspect) {
      let sourceHeight = (imgWidth * targetRect.height) /
        targetRect.width;
      sourceBox = {
        left: 0,
        top: Math.floor((imgHeight - sourceHeight) * 0.5),
        width: imgWidth,
        height: sourceHeight,
      };
    }
    else {
      let sourceWidth = (imgHeight * targetRect.width) /
        targetRect.height;
      sourceBox = {
        left: Math.floor((imgWidth - sourceWidth) * 0.5),
        top: 0,
        width: sourceWidth,
        height: imgHeight,
      };
    }
  }
  return sourceBox;
}

function isPointInNode(ctx: CanvasRenderingContext2D, borderRadius: number, layoutLeft: number, layoutTop: number, w: number, h: number, offsetX: number, offsetY: number): number {
  closedInnerBorderPath(ctx, 0, 0, 0, 0, borderRadius, layoutLeft, layoutTop, w, h);
  return ctx.isPointInPath(offsetX, offsetY) ? 1 : 0;
}

// source: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js#L37
function detectTouchDevice() {
  if (
    'ontouchstart' in window ||
    ((window as any).DocumentTouch && document instanceof (window as any).DocumentTouch)
  ) {
    return true;
  }
  const prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-', ''];
  return (window as any).matchMedia(['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('')).matches;
};

function reverseObject(obj: {[key: string]: string}) {
  let result: {[eventName: string]: string} = {};
  for(let key in obj) {
    result[obj[key]] = key;
  }
  return result;
}

const isTouchDevice = detectTouchDevice();

const eventsMapping: {[eventName: string]: string} = isTouchDevice ? {
  click: "click",
  mousedown: "touchstart",
  mousemove: "touchmove",
  mouseup: "touchend",
} : {
  click: "click",
  mousedown: "mousedown",
  mousemove: "mousemove",
  mouseup: "mouseup",
};

const reverseEventsMapping = reverseObject(eventsMapping);

// THERE IS AN COPY IN CANVAS ELEMENT
export const HAS_CHILDREN = 1;
export const HAS_BORDER = 2;
export const HAS_BACKGROUND = 4;
export const HAS_SHADOW = 8;
export const HAS_BACKGROUND_IMAGE = 16;
export const HAS_CLIPPING = 32;
export const HAS_BORDER_RADIUS = 64;
export const SKIP = 128;
export const HAS_TEXT = 256;
// export const FORCE_CACHE = 512;

const NEEDS_DIMENSIONS = HAS_BORDER | HAS_BACKGROUND | HAS_SHADOW | HAS_BACKGROUND_IMAGE | HAS_CLIPPING | HAS_TEXT;

export class CanvasView {
  public doc!: CanvasDocument;
  private _spec: CanvasElement;
  private _defaultLineHeightMultiplier: number;
  private _canvas!: HTMLCanvasElement;
  private _ctx!: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private _width: number;
  private _height: number;
  private _direction: YogaDirection = DIRECTION_LTR;
  private _previousTarget: CanvasElement | undefined;

  private _listenersState: IListenersState = {
    click: false,
    mousedown: false,
    mousemove: false,
    mouseup: false
  };

  public _currentQueue: ZIndexQueue = new ZIndexQueue();
  private _queues: ZIndexQueue[] = [];
  private _lastCachedContext: CachedCanvasContext;

  constructor(
    canvas: HTMLCanvasElement,
    spec: CanvasElement,
    left: number,
    top: number,
    width: number,
    height: number,
    direction: YogaDirection = DIRECTION_LTR,
    defaultLineHeightMultiplier = 1.3
  ) {
    this._canvas = canvas;
    this._spec = spec;
    this._processEvent = this._processEvent.bind(this);
    this._ctx = canvas.getContext("2d")!;
    this._lastCachedContext = new CachedCanvasContext(this._ctx, this._ctx);
    this._defaultLineHeightMultiplier = defaultLineHeightMultiplier;
    this.x = left;
    this.y = top;
    this._width = width;
    this._height = height;
    this._direction = direction;
  }

  _setDoc(doc: CanvasDocument) {
    this.doc = doc;
  }

  setTargetRegion(left: number, top: number, width: number, height: number) {
    this.x = left;
    this.y = top;
    this._width = width;
    this._height = height;
  }

  destroy() {
    this._unbindEventHandlers();
  }

  private _unbindEventHandlers() {
    this.bindEventHandlers({
      // only these 5 are supported
      click: 0,
      mousedown: 0,
      mousemove: 0,
      mouseup: 0
    });
  }

  bindEventHandlers(nextListenersState: {[eventName: string]: number} = this.doc.eventCounter) {
    for (let name in mapEventType) {
      if (nextListenersState[name]) {
        if (!this._listenersState[name]) {
          this._listenersState[name] = true;
          this._canvas.addEventListener(eventsMapping[name] as any, this._processEvent);
        }
      } else {
        if (this._listenersState[name]) {
          this._listenersState[name] = false;
          this._canvas.removeEventListener(eventsMapping[name] as any, this._processEvent);
        }
      }
    }
  }

  private _processEvent = (e: MouseEvent | TouchEvent) => {
    let target: CanvasElement | undefined;
    if (e instanceof MouseEvent) {
      target = this.findHitTarget(e.offsetX, e.offsetY);
    } else {
      const targetTouch = 
        e.touches.item(0) ||
        e.changedTouches.item(0);
      if (!targetTouch) {
        // no multi touch support
        return;
      }
      const canvasRect = this._canvas.getBoundingClientRect();
      const offsetX = targetTouch.clientX - canvasRect.left;
      const offsetY = targetTouch.clientY - canvasRect.top;
      target = this.findHitTarget(offsetX, offsetY);
    }
    
    if (e.type === "mousemove" || e.type === "touchmove" ) {
      this._trackMouseEnterAndLeave(e, target);
    }
    if (!target) {
      return;
    }
    bubbleEvent(e, reverseEventsMapping[e.type], target);
  }

  public findHitTarget(offsetX: number, offsetY: number): CanvasElement | undefined {
    // hits rendered region?
    let ctx = this._ctx;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this._width, this._height);
    if (!ctx.isPointInPath(offsetX, offsetY)) {
      return;
    }

    let start = performance.now();
    var queue = new ZIndexQueue();
    let foundTarget = this._hitTest(offsetX, offsetY, this._spec, this.x, this.y, queue);
    let queueTarget = queue.hitTest(offsetX, offsetY, this);
    if (queueTarget) {
      foundTarget = queueTarget;
    }

    console.log("Hit test took " + (performance.now() - start).toFixed(1) + 'ms');

    return foundTarget;
  }

  public _hitTest(
    offsetX: number, offsetY: number,
    node: CanvasElement,
    x: number,
    y: number,
    queue: ZIndexQueue
  ): CanvasElement | undefined {
    const ctx = this._ctx;
    const overflow = node.style.overflow;
    const shouldClipChildren = overflow === OVERFLOW_HIDDEN || overflow === OVERFLOW_SCROLL;
    const _yogaNode = node._yogaNode;
    const layoutLeft = _yogaNode.getComputedLeft() + x,
      layoutTop = _yogaNode.getComputedTop() + y;
    
    var nodeMatch: number = -1;
    
    if (shouldClipChildren) {
      nodeMatch = isPointInNode(ctx, node.style.borderRadius || 0, layoutLeft, layoutTop, _yogaNode.getComputedWidth(), _yogaNode.getComputedHeight(), offsetX, offsetY);
      if (!nodeMatch) {
        return;
      }
      queue = new ZIndexQueue();
    }

    let foundTarget = this._hitTestChildren(node, queue, layoutLeft, layoutTop, offsetX, offsetY);
    
    if (shouldClipChildren) {
      let queueTarget = queue.hitTest(offsetX, offsetY, this);
      if (queueTarget) {
        foundTarget = queueTarget;
      }
    }

    if (!foundTarget) {
      if (nodeMatch === -1) {
        nodeMatch = isPointInNode(ctx, node.style.borderRadius || 0, layoutLeft, layoutTop, _yogaNode.getComputedWidth(), _yogaNode.getComputedHeight(), offsetX, offsetY);
      }
      if (nodeMatch) {
        foundTarget = node;
      }
    }

    return foundTarget;
  }

  private _hitTestChildren(node: CanvasElement, queue: ZIndexQueue, layoutLeft: number, layoutTop: number, offsetX: number, offsetY: number) {
    
    // if item has border
    // must verify if pointer is over border
    // also nodeMatch has a different meaning,
    // almost as overflow: hidden, but zIndex still should be investigated

    if (!node.children) {
      return undefined;
    }
    let foundTarget: CanvasElement | undefined;
    for (var i = node.children.length - 1; i >= 0; i--) {
      var childNode = node.children[i];
      if (childNode.style.position === POSITION_TYPE_ABSOLUTE) {
        queue.unshift({
          node: childNode,
          x: layoutLeft,
          y: layoutTop,
        });
      }
      else if (!foundTarget) {
        foundTarget = this._hitTest(offsetX, offsetY, node.children[i], layoutLeft, layoutTop, queue);
      }
      else {
        this._hitTestBuildZIndexQueue(node.children[i], layoutLeft, layoutTop, queue);
      }
    }
    return foundTarget;
  }

  /**
   * Only builds ZIndex queue...
   */
  private _hitTestBuildZIndexQueue(
    node: CanvasElement,
    x: number,
    y: number,
    queue: ZIndexQueue
  ): void {
    const overflow = node.style.overflow;
    if (overflow === OVERFLOW_HIDDEN || overflow === OVERFLOW_SCROLL) {
      return;
    }

    if (node.children) {
      const _yogaNode = node._yogaNode;
      const layoutLeft = _yogaNode.getComputedLeft() + x,
        layoutTop = _yogaNode.getComputedTop() + y;
      for (var i = node.children.length - 1; i >= 0; i--) {
        var childNode = node.children[i];
        if (childNode.style.position === POSITION_TYPE_ABSOLUTE) {
          queue.unshift({
            node: childNode,
            x: layoutLeft,
            y: layoutTop,
          });
        } else {
          this._hitTestBuildZIndexQueue(
            node.children[i],
            layoutLeft,
            layoutTop,
            queue
          );
        }
      }
    }
  }

  // tslint:disable:strict-type-predicates
  private _trackMouseEnterAndLeave(e: Event, nextTarget: CanvasElement | undefined): void {
    // let event = new LayoutEvent(e, node);
    let previousTargets = getAncestorsAndSelf(this._previousTarget);
    let nextTargets = getAncestorsAndSelf(nextTarget);
    let i: number;
    for (i = 0; i < previousTargets.length; i += 1) {
      var pt = previousTargets[i];
      if (
        pt.$EV && typeof pt.$EV.onMouseLeave === "function" &&
        nextTargets.indexOf(pt) === -1
      ) {
        pt.$EV.onMouseLeave(new CanvasViewEvent(e, "mouseleave", pt, false));
      }
    }
    for (i = 0; i < nextTargets.length; i += 1) {
      var nt = nextTargets[i];
      if (
        nt.$EV && typeof nt.$EV.onMouseEnter === "function" &&
        previousTargets.indexOf(nt) === -1
      ) {
        nt.$EV.onMouseEnter(new CanvasViewEvent(e, "mouseenter", nt, false));
      }
    }
    this._previousTarget = nextTarget;
  }

  private _layout() {
    if (this._spec._yogaNode.isDirty()) {
      this._spec._yogaNode.calculateLayout(
        this._width,
        this._height,
        this._direction
      );
    }
  }

  public render() {
    this._layout();
    let ctx = this._ctx;
    ctx.clearRect(this.x, this.y, this._width, this._height);
    // save before clipping
    ctx.save();
    this._addContext();
    // next line gives faster rendering for unknown reasons
    ctx.beginPath();
    ctx.rect(this.x, this.y, this._width, this._height);
    ctx.clip();
    this._renderNode(this._spec, this.x, this.y);
    // render absolutes within clipping rect
    this._currentQueue.render(this);
    ctx.restore();
    this._removeContext();
  }

  // public _renderNodeWithCache(
  //   node: CanvasElement,
  //   x: number,
  //   y: number
  // ) {
  //   const yogaNode = node._yogaNode;
  //   const yogaLeft = yogaNode.getComputedLeft(),
  //     yogaTop = yogaNode.getComputedTop();
  //   let region = node._cachedRender;
  //   if (node._dirty || !region) {
  //     const layoutWidth = yogaNode.getComputedWidth(),
  //       layoutHeight = yogaNode.getComputedHeight();
  //     if (region) {
  //       if (region.width !== layoutWidth || region.height !== layoutHeight) {
  //         // sad, but need to reallocate canvas region
  //         region.setFree();
  //         region = null;
  //       }
  //     }
  //     if (region === null) {
  //       // create secondary context
  //       region = textureAtlas.allocate(layoutWidth, layoutHeight);
  //       node._cachedRender = region;
  //     }

  //     // save context
  //     let oldContext = this._ctx;
  //     this._ctx = region.context2d;
  //     this._queues.push(this._currentQueue);
  //     this._currentQueue = new ZIndexQueue();
  //     let oldCachedContext = this._lastCachedContext;
  //     this._lastCachedContext = new CachedCanvasContext(this._ctx, this._ctx);
  
  //     // render
  //     node.forceCache(false);
  //     this._ctx.clearRect(region.left, region.top, region.width, region.height);
  //     this._renderNode(node, region.left - yogaLeft, region.top - yogaTop);
  //     node.forceCache(true);

  //     // restore context
  //     this._ctx = oldContext;
  //     this._currentQueue = this._queues.pop()!;
  //     this._lastCachedContext = oldCachedContext;

  //     // save render
  //     node._cachedRender = region;
  //   }
  //   this._ctx.drawImage(region.canvas,
  //     region.left, region.top, region.width, region.height,
  //     yogaLeft + x, yogaTop + y, region.width, region.height,
  //   );
  // }
  
  public _renderNode(
    node: CanvasElement,
    x: number,
    y: number
  ) {
    const flags = node.getFlags();
    if (flags & SKIP) {
      return;
    }
    // if (flags & FORCE_CACHE) {
    //   this._renderNodeWithCache(node, x, y);
    //   return;
    // }
    const ctx = this._ctx;
    const yogaNode = node._yogaNode;
    const style = node.style;
    const needDimensions = flags & NEEDS_DIMENSIONS;
    const layoutLeft = yogaNode.getComputedLeft() + x,
      layoutTop = yogaNode.getComputedTop() + y;
    const layoutWidth = needDimensions ? yogaNode.getComputedWidth() : 0,
      layoutHeight = needDimensions ? yogaNode.getComputedHeight() : 0;

    const hasBorder = flags & HAS_BORDER;
    const borderLeft = hasBorder ? yogaNode.getComputedBorder(EDGE_LEFT) : 0,
      borderTop = hasBorder ? yogaNode.getComputedBorder(EDGE_TOP) : 0,
      borderRight = hasBorder ? yogaNode.getComputedBorder(EDGE_RIGHT) : 0,
      borderBottom = hasBorder ? yogaNode.getComputedBorder(EDGE_BOTTOM) : 0;
    const borderRadius = flags & HAS_BORDER_RADIUS ? style.borderRadius! : 0;
    const shouldClipChildren = flags & HAS_CLIPPING;

    node._dirty = false;

    if (flags & HAS_BACKGROUND) {
      this._lastCachedContext.setFillStyle(style.background!);
      if (borderRadius > 0) {
        if (hasBorder) {
          // the only found way to fix rendering artifacts with rounded borders
          // 9 hrs wasted here
          // this still doesn't support semi-transparent borders
          // leaving this for future...
          closedInnerBorderPath(
            ctx,
            borderLeft > 0.25 ? borderLeft - 0.25 : borderLeft,
            borderTop > 0.25 ? borderTop - 0.25 : borderTop,
            borderRight > 0.25 ? borderRight - 0.25 : borderRight,
            borderBottom ? borderBottom - 0.25 : borderBottom,
            borderRadius,
            layoutLeft, layoutTop, layoutWidth, layoutHeight
          );
        } else {
          closedInnerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
        }
        ctx.fill();
      } else {
        // optimize
        ctx.fillRect(
          layoutLeft + borderLeft,
          layoutTop + borderTop,
          layoutWidth - borderLeft - borderRight,
          layoutHeight - borderTop - borderBottom
        );
      }
    }

    if (flags & HAS_SHADOW) {
      this._renderShadow(
        ctx,
        borderRadius,
        layoutLeft, layoutTop, layoutWidth, layoutHeight,
        style,
        hasBorder
      );
    }
    if (flags & HAS_BACKGROUND_IMAGE) {
      this._renderBackgroundImage(style, layoutLeft, layoutTop, layoutWidth, layoutHeight, borderLeft, borderTop, borderRight, borderBottom);
    }
    if (hasBorder) {
      this._renderBorder(style.borderColor!, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    }

    if (shouldClipChildren) {
      this._addContext();
      // set clipping
      this._clipNode(borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    }

    if (flags & HAS_CHILDREN) {
      const children = node.children;
      const len = node._childrenLength;
      for (var i = 0; i < len; i++) {
        var childNode = children![i];
        // should be CanvasElement?
        if ((childNode as any)._isAbsolute) {
          this._currentQueue.push({
            node: childNode,
            x: layoutLeft,
            y: layoutTop,
          });
        } else {
          this._renderNode(
            childNode,
            layoutLeft,
            layoutTop
          );
        }
      }
    } else if (flags & HAS_TEXT) {
      this._renderText(node,
        layoutLeft + borderLeft,
        layoutTop + borderTop,
        layoutWidth -
            borderLeft -
            borderRight,
        layoutHeight -
            borderTop -
            borderBottom
      );
    }

    if (shouldClipChildren) {
      // render absolutes within clipping box
      this._currentQueue.render(this);
      this._removeContext();
    }
  }

  private _renderShadow(
    ctx: CanvasRenderingContext2D,
    borderRadius: number,
    layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number,
    style: IStyleProps,
    hasBorder: number
  ) {
    // a bit tricky
    // as shadow should not be visible under element
    // setup clipping of the content
    ctx.save();

    const shadowBlur = Math.round(style.shadowBlur!) || 0,
      shadowOffsetX = Math.round(style.shadowOffsetX!) || 0,
      shadowOffsetY = Math.round(style.shadowOffsetY!) || 0;

    let borderIncrease =
      shadowBlur + Math.max(Math.abs(shadowOffsetX), Math.abs(shadowOffsetY));
    createBorderPath(
      ctx,
      borderIncrease,
      borderIncrease,
      borderIncrease,
      borderIncrease,
      borderIncrease + borderRadius,
      layoutLeft - borderIncrease,
      layoutTop - borderIncrease,
      layoutWidth + 2 * borderIncrease,
      layoutHeight + 2 * borderIncrease,
    );
    ctx.clip();
    // init shadow
    ctx.shadowColor = style.shadowColor!;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;
    ctx.beginPath();
    outerBorderPath(ctx, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight, true);
    ctx.fillStyle = hasBorder ? style.borderColor! : style.background!;
    ctx.fill();
    ctx.restore();
  }

  private _renderText(
    node: CanvasElement,
    left: number, top: number, width: number, height: number
  ) {
    const style = node.style;
    const ctx = this._ctx;
    
    const _yogaNode = node._yogaNode;
    const paddingLeft = _yogaNode.getComputedPadding(EDGE_LEFT),
        paddingTop = _yogaNode.getComputedPadding(EDGE_TOP),
        paddingRight = _yogaNode.getComputedPadding(EDGE_RIGHT),
        paddingBottom = _yogaNode.getComputedPadding(EDGE_BOTTOM);
    
    this._lastCachedContext.setFillStyle(style.color!);
    this._lastCachedContext.setFont(style._fullFont!);
    if (style.maxLines && style.maxLines > 1) {
      renderMultilineText(
        ctx,
        this._lastCachedContext,
        node.content!,
        left + paddingLeft,
        top + paddingTop,
        width - paddingLeft - paddingRight,
        height - paddingTop - paddingBottom,
        style.lineHeight
          ? style.lineHeight
          : style.fontSize ? style.fontSize * this._defaultLineHeightMultiplier : 0,
        style.textAlign,
        style.verticalAlign,
        style.maxLines,
        style.textOverflow === "ellipsis" ? ellipsis : style.textOverflow
      );
    } else {
      renderText(
        ctx,
        this._lastCachedContext,
        node.content!,
        left + paddingLeft,
        top + paddingTop,
        width - paddingLeft - paddingRight,
        height - paddingTop - paddingBottom,
        style.textAlign,
        style.verticalAlign,
        style.textOverflow === "ellipsis" ? ellipsis : style.textOverflow,
        node as any
      );
    }
  }

  private _renderBackgroundImage(
    style: IStyleProps,
    layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number,
    borderLeft: number, borderTop: number, borderRight: number, borderBottom: number
  ) {
    let url = style.backgroundImage!;
    let targetRect: IRect = {
      left: layoutLeft + borderLeft,
      top: layoutTop + borderTop,
      width:
        layoutWidth -
        borderLeft -
        borderRight,
      height:
        layoutHeight -
        borderTop -
        borderBottom
    };

    // try to get image size without accessing image itself
    let imageSize = imageSizeCache.get(url);
    if (!imageSize) {
      // image was never loaded...
      let imgMaybe = imageCache.get(url);
      if (imgMaybe instanceof ImageCacheEntry) {
        // store image size
        imageSize = {
          width: imgMaybe.width,
          height: imgMaybe.height,
        };
        imageSizeCache.set(url, imageSize);
      } else if (imgMaybe instanceof Error) {
        // nothing to do
        return;
      } else {
        renderQueue.renderAfter(this, imgMaybe);
        return;
      }
    }

    let sourceRect: IRect = getImgBackgroundSourceRect(style, targetRect, imageSize.width, imageSize.height);
    let cachedImageMaybe = textureAtlasImageCache.getImage(url, sourceRect, targetRect);
    if (cachedImageMaybe instanceof TextureAtlasRegion) {
      this._ctx.drawImage(cachedImageMaybe.canvas,
        cachedImageMaybe.left, cachedImageMaybe.top, cachedImageMaybe.width, cachedImageMaybe.height,
        targetRect.left, targetRect.top, targetRect.width, targetRect.height
      );
    } else if (!(cachedImageMaybe instanceof Error)) {
      // should be rare case
      renderQueue.renderAfter(this, cachedImageMaybe);
    }
  }

  private _clipNode(borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number) {
    var ctx = this._ctx;
    closedInnerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    ctx.clip();
  }

  public _addContext() {
    this._queues.push(this._currentQueue);
    this._currentQueue = new ZIndexQueue();
    this._ctx.save();
    this._lastCachedContext = this._lastCachedContext.createNestedContext();
  }

  public _removeContext() {
    this._currentQueue = this._queues.pop()!;
    this._ctx.restore();
    this._lastCachedContext = this._lastCachedContext.getParentContext();
  }

  private _renderBorder(strokeStyle: string, borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number) {
    var ctx = this._ctx;
    createBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    this._lastCachedContext.setFillStyle(strokeStyle);
    ctx.fill();
  }
}
