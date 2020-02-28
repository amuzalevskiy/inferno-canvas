import { IRenderSpec } from './node';
import { CanvasView } from './CanvasView';
import { CanvasElement } from './CanvasElement';
export declare class ZIndexQueue {
    queue: Map<number, Array<IRenderSpec>>;
    empty: boolean;
    push(nodeRenderSpec: IRenderSpec): void;
    unshift(nodeRenderSpec: IRenderSpec): void;
    private getOrCreateQueue;
    render(view: CanvasView): void;
    hitTest(offsetX: number, offsetY: number, view: CanvasView): CanvasElement | undefined;
}
