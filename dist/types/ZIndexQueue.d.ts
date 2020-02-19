import { IRenderSpec, ILayoutNode } from './node';
import { CanvasView } from './CanvasView';
export declare class ZIndexQueue {
    queue: Map<number, Array<IRenderSpec>>;
    empty: boolean;
    push(nodeRenderSpec: IRenderSpec): void;
    unshift(nodeRenderSpec: IRenderSpec): void;
    private getOrCreateQueue;
    render(view: CanvasView): void;
    hitTest(e: MouseEvent, view: CanvasView): ILayoutNode | undefined;
}
