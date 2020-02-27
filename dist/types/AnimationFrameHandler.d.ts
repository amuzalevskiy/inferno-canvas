import { CanvasView } from './CanvasView';
import { CanvasElementRegistry } from './CanvasElementRegistry';
declare type RafCallback = (now: number) => void;
export declare class AnimationFrameHandler {
    private _counter;
    private _indexToCbMap;
    private _cycling;
    private _queued;
    private _views;
    private _callbacks;
    private avgCycleTimeSpent;
    private avgRenderCycleTimeSpent;
    private readonly registry;
    private enableTimeReport;
    constructor(registry: CanvasElementRegistry, enableTimeReport: boolean);
    _addView(view: CanvasView): void;
    _removeView(view: CanvasView): void;
    _checkEnqueued(): void;
    _pushCb(cb: RafCallback): number;
    _removeCb(index: number): void;
    _process: (cycleStart: number) => void;
}
export {};
