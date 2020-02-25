import { YogaDirection } from "yoga-layout";
import { ILayoutNode } from "./node";
import { ZIndexQueue } from "./ZIndexQueue";
import { CanvasElement } from "./CanvasElement";
import { CanvasDocument } from "./CanvasDocument";
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
    constructor(canvas: HTMLCanvasElement, spec: CanvasElement, left: number, top: number, width: number, height: number, direction?: YogaDirection, defaultLineHeightMultiplier?: number);
    _setDoc(doc: CanvasDocument): void;
    setTargetRegion(left: number, top: number, width: number, height: number): void;
    destroy(): void;
    private _unbindEventHandlers;
    bindEventHandlers(nextListenersState?: {
        [eventName: string]: number;
    }): void;
    private _processEvent;
    findHitTarget(offsetX: number, offsetY: number): ILayoutNode | undefined;
    _hitTest(offsetX: number, offsetY: number, node: ILayoutNode, x: number, y: number, queue: ZIndexQueue): ILayoutNode | undefined;
    private _hitTestChildren;
    /**
     * Only builds ZIndex queue...
     */
    private _hitTestBuildZIndexQueue;
    private _trackMouseEnterAndLeave;
    private _layout;
    render(): void;
    _renderNode(node: ILayoutNode, x: number, y: number, queue: ZIndexQueue): void;
    private _renderShadow;
    private _renderText;
    private _renderBackgroundImage;
    private _applyClip;
    private _renderBorder;
}
