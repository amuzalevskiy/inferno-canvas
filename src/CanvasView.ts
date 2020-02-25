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

import { ImageCache } from "./ImageCache";
import { renderQueue } from "./renderQueue";
import {
  ILayoutNode,
  IRect,
  IStyleProps,
} from "./node";
import { ZIndexQueue } from "./ZIndexQueue";
import { LayoutEvent, bubbleEvent, mapEventType } from "./LayoutEvent";
import { CanvasElement } from "./CanvasElement";
import { TextureAtlas } from "./TextureAtlas";
import { CanvasDocument } from "./CanvasDocument";

const ellipsis = String.fromCharCode(0x2026);

var defaultImageCache = ImageCache.createBasketsImageCache({
  basketLifetime: 1500,
  maxBaskets: 4
});

var defaultTextureAtlas = new TextureAtlas(256);

interface IListenersState {
  [eventName: string]: boolean;
}

function getAncestorsAndSelf(node: ILayoutNode|undefined): Array<ILayoutNode> {
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


/**
 * Caches image to offscreen canvas when it needs resizing
 */
function drawImageWithCache(ctx: CanvasRenderingContext2D, backgroundImage: HTMLImageElement, sourceRect: IRect, targetRect: IRect) {
  // // no TextureAtlas
  // ctx.drawImage(backgroundImage,
  //   sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height,
  //   targetRect.left, targetRect.top, targetRect.width, targetRect.height
  // );
  let spec = defaultTextureAtlas.getImage(backgroundImage, sourceRect, targetRect);
  ctx.drawImage(spec.source,
    spec.left, spec.top, spec.width, spec.height,
    targetRect.left, targetRect.top, targetRect.width, targetRect.height
  );
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
  private _previousTarget: ILayoutNode | undefined;

  private _listenersState: IListenersState = {
    click: false,
    mousedown: false,
    mousemove: false,
    mouseup: false
  };

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
    let target: ILayoutNode | undefined;
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

  public findHitTarget(offsetX: number, offsetY: number): ILayoutNode | undefined {
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
    node: ILayoutNode,
    x: number,
    y: number,
    queue: ZIndexQueue
  ): ILayoutNode | undefined {
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

  private _hitTestChildren(node: ILayoutNode, queue: ZIndexQueue, layoutLeft: number, layoutTop: number, offsetX: number, offsetY: number) {
    
    // if item has border
    // must verify if pointer is over border
    // also nodeMatch has a different meaning,
    // almost as overflow: hidden, but zIndex still should be investigated

    if (!node.children) {
      return undefined;
    }
    let foundTarget: ILayoutNode | undefined;
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
    node: ILayoutNode,
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
  private _trackMouseEnterAndLeave(e: Event, nextTarget: ILayoutNode | undefined): void {
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
        pt.$EV.onMouseLeave(new LayoutEvent(e, "mouseleave", pt, false));
      }
    }
    for (i = 0; i < nextTargets.length; i += 1) {
      var nt = nextTargets[i];
      if (
        nt.$EV && typeof nt.$EV.onMouseEnter === "function" &&
        previousTargets.indexOf(nt) === -1
      ) {
        nt.$EV.onMouseEnter(new LayoutEvent(e, "mouseenter", nt, false));
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
    var queue = new ZIndexQueue();
    let ctx = this._ctx;
    ctx.clearRect(this.x, this.y, this._width, this._height);
    // save before clipping
    ctx.save();
    // next line gives faster rendering for unknown reasons
    ctx.beginPath();
    ctx.rect(this.x, this.y, this._width, this._height);
    ctx.clip();
    this._renderNode(this._spec, this.x, this.y, queue);
    // render absolutes within clipping rect
    queue.render(this);
    ctx.restore();
  }

  public _renderNode(
    node: ILayoutNode,
    x: number,
    y: number,
    queue: ZIndexQueue
  ) {
    var ctx = this._ctx;
    var _yogaNode = node._yogaNode;
    var style = node.style;
    var shouldClipChildren = style.overflow === OVERFLOW_HIDDEN || style.overflow === OVERFLOW_SCROLL;
    var layoutLeft = _yogaNode.getComputedLeft() + x,
      layoutTop = _yogaNode.getComputedTop() + y,
      layoutWidth = _yogaNode.getComputedWidth(),
      layoutHeight = _yogaNode.getComputedHeight();

    var borderLeft = _yogaNode.getComputedBorder(EDGE_LEFT),
      borderTop = _yogaNode.getComputedBorder(EDGE_TOP),
      borderRight = _yogaNode.getComputedBorder(EDGE_RIGHT),
      borderBottom = _yogaNode.getComputedBorder(EDGE_BOTTOM),
      borderRadius = node.style.borderRadius || 0;

    var hasBorder = !!style.borderColor &&
      (borderTop > 0 ||
        borderLeft > 0 ||
        borderBottom > 0 ||
        borderRight > 0);

    if (style.background) {
      ctx.fillStyle = style.background;
      if (borderRadius > 0) {
        if (borderRadius > 0 && hasBorder) {
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

    if (style.shadowColor && style.shadowColor !== "transparent") {
      var shadowOffsetX = Math.round(style.shadowOffsetX!) || 0;
      var shadowOffsetY = Math.round(style.shadowOffsetY!) || 0;
      var shadowBlur = Math.round(style.shadowBlur!) || 0;
      if (shadowBlur !== 0 || shadowOffsetX !== 0 || shadowOffsetY !== 0) {
        this._renderShadow(
          ctx,
          shadowBlur,
          shadowOffsetX,
          shadowOffsetY,
          borderRadius,
          layoutLeft, layoutTop, layoutWidth, layoutHeight,
          style,
          hasBorder
        );
      }
    }
    if (style.backgroundImage) {
      this._renderBackgroundImage(style, layoutLeft, layoutTop, layoutWidth, layoutHeight, borderLeft, borderTop, borderRight, borderBottom, borderRadius, ctx);
    }
    if (hasBorder) {
      this._renderBorder(style.borderColor!, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    }

    if (shouldClipChildren) {
      // set clipping
      ctx.save();
      this._applyClip(borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
      queue = new ZIndexQueue();
    }

    if (node.children) {
      var len = node.children.length;
      for (var i = 0; i < len; i++) {
        var childNode = node.children[i];
        if (childNode.style.position === POSITION_TYPE_ABSOLUTE) {
          queue.push({
            node: childNode,
            x: layoutLeft,
            y: layoutTop,
          });
        } else {
          this._renderNode(
            node.children[i],
            layoutLeft,
            layoutTop,
            queue
          );
        }
      }
    } else if (node.content !== undefined) {
      var paddingLeft = _yogaNode.getComputedPadding(EDGE_LEFT),
        paddingTop = _yogaNode.getComputedPadding(EDGE_TOP),
        paddingRight = _yogaNode.getComputedPadding(EDGE_RIGHT),
        paddingBottom = _yogaNode.getComputedPadding(EDGE_BOTTOM);
      this._renderText(ctx, style, 
        layoutLeft + paddingLeft + borderLeft,
        layoutTop + paddingTop + borderTop,
        layoutWidth -
            paddingLeft -
            paddingRight -
            borderLeft -
            borderRight,
        layoutHeight -
            paddingTop -
            paddingBottom -
            borderTop -
            borderBottom,
        node);
    }

    if (shouldClipChildren) {
      // render absolutes within clipping box
      queue.render(this);
      ctx.restore();
    }
  }

  private _renderShadow(
    ctx: CanvasRenderingContext2D,
    shadowBlur: number,
    shadowOffsetX: number,
    shadowOffsetY: number,
    borderRadius: number,
    layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number,
    style: IStyleProps,
    hasBorder: boolean
  ) {
    // a bit tricky
    // as shadow should not be visible under element
    // setup clipping of the content
    ctx.save();
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
    ctx.shadowBlur = style.shadowBlur!;
    ctx.shadowOffsetX = style.shadowOffsetX!;
    ctx.shadowOffsetY = style.shadowOffsetY!;
    ctx.beginPath();
    outerBorderPath(ctx, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight, true);
    ctx.fillStyle = hasBorder ? style.borderColor! : style.background!;
    ctx.fill();
    ctx.restore();
  }

  private _renderText(
    ctx: CanvasRenderingContext2D,
    style: IStyleProps,
    textLeft: number, textTop: number, textWidth: number, textHeight: number, 
    node: ILayoutNode
  ) {
    if (!style.color || !style.font || style.fontSize === undefined) {
      // unable to render
      return;
    }

    ctx.fillStyle = style.color;
    ctx.font = style.fontSize + "px " + style.font;

    if (node.style.maxLines && node.style.maxLines > 1) {
      renderMultilineText(
        ctx,
        node.content!,
        textLeft, textTop, textWidth, textHeight,
        style.lineHeight
          ? style.lineHeight
          : style.fontSize * this._defaultLineHeightMultiplier,
        style.textAlign,
        style.verticalAlign,
        node.style.maxLines,
        style.textOverflow === "ellipsis" ? ellipsis : style.textOverflow
      );
    } else {
      renderText(
        ctx,
        node.content!,
        textLeft, textTop, textWidth, textHeight,
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
    borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number,
    ctx: CanvasRenderingContext2D
  ) {
    var imgMaybe = defaultImageCache.get(style.backgroundImage!);
    if (!(imgMaybe instanceof Error)) {
      if (imgMaybe instanceof HTMLImageElement) {
        var backgroundImage = imgMaybe as any as HTMLImageElement;
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
        var imgWidth = backgroundImage.width,
          imgHeight = backgroundImage.height;

        let sourceRect: IRect = getImgBackgroundSourceRect(style, targetRect, imgWidth, imgHeight);
        drawImageWithCache(ctx, backgroundImage, sourceRect, targetRect);
      } else {
        // plan rendering
        renderQueue.renderAfter(this, imgMaybe);
      }
    }
  }

  private _applyClip(borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number) {
    var ctx = this._ctx;
    closedInnerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    ctx.clip();
  }

  private _renderBorder(strokeStyle: string, borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number, layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number) {
    var ctx = this._ctx;
    createBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    ctx.fillStyle = strokeStyle;
    ctx.fill();
  }
}
