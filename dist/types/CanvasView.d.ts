import { YogaDirection } from "yoga-layout";
import { ZIndexQueue } from "./ZIndexQueue";
import { CanvasElement } from "./CanvasElement";
import { CanvasDocument } from "./CanvasDocument";
export declare const HAS_CHILDREN = 1;
export declare const HAS_BORDER = 2;
export declare const HAS_BACKGROUND = 4;
export declare const HAS_SHADOW = 8;
export declare const HAS_BACKGROUND_IMAGE = 16;
export declare const HAS_CLIPPING = 32;
export declare const HAS_BORDER_RADIUS = 64;
export declare const SKIP = 128;
export declare const HAS_TEXT = 256;
export declare class CanvasView {
    doc: CanvasDocument;
    private _spec;
    private _defaultLineHeightMultiplier;
    private _canvas;
    private _ctx;
    private x;
    private y;
    private _width;
    private _height;
    private _direction;
    private _previousTarget;
    private _listenersState;
    _currentQueue: ZIndexQueue;
    private queues;
    private _lastCachedContext;
    constructor(canvas: HTMLCanvasElement, spec: CanvasElement, left: number, top: number, width: number, height: number, direction?: YogaDirection, defaultLineHeightMultiplier?: number);
    _setDoc(doc: CanvasDocument): void;
    setTargetRegion(left: number, top: number, width: number, height: number): void;
    destroy(): void;
    private _unbindEventHandlers;
    bindEventHandlers(nextListenersState?: {
        [eventName: string]: number;
    }): void;
    private _processEvent;
    findHitTarget(offsetX: number, offsetY: number): CanvasElement | undefined;
    _hitTest(offsetX: number, offsetY: number, node: CanvasElement, x: number, y: number, queue: ZIndexQueue): CanvasElement | undefined;
    private _hitTestChildren;
    /**
     * Only builds ZIndex queue...
     */
    private _hitTestBuildZIndexQueue;
    private _trackMouseEnterAndLeave;
    private _layout;
    render(): void;
    _renderNode(node: CanvasElement, x: number, y: number): void;
    private _renderShadow;
    private _renderText;
    private _renderBackgroundImage;
    private _clipNode;
    _addContext(): void;
    _removeContext(): void;
    private _renderBorder;
}
