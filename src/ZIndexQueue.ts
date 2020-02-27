import { IRenderSpec } from './node';
import { CanvasView } from './CanvasView';
import { CanvasElement } from './CanvasElement';
export class ZIndexQueue {
    queue!: Map<number, Array<IRenderSpec>>;
    empty: boolean = true;

    push(nodeRenderSpec: IRenderSpec) {
        const zIndex = nodeRenderSpec.node.style.zIndex ? nodeRenderSpec.node.style.zIndex : 0;
        this.getOrCreateQueue(zIndex).push(nodeRenderSpec);
    }

    unshift(nodeRenderSpec: IRenderSpec) {
        const zIndex = nodeRenderSpec.node.style.zIndex ? nodeRenderSpec.node.style.zIndex : 0;
        this.getOrCreateQueue(zIndex).unshift(nodeRenderSpec);
    }

    private getOrCreateQueue(zIndex: number) {
        if (this.empty) {
            // optimal
            this.empty = false;
            // don't allocate Map until first push
            this.queue = new Map();
        }
        if (!this.queue.has(zIndex)) {
            this.queue.set(zIndex, []);
        }
        return this.queue.get(zIndex)!;
    }

    render(view: CanvasView) {
        if (this.empty) {
            return;
        }
        let zIndexes = Array.from(this.queue.keys());
        zIndexes.sort();
        for (let i = 0; i < zIndexes.length; i += 1) {
            let zIndex = zIndexes[i];
            let renderSpecs = this.queue.get(zIndex)!;
            for (let j = 0; j < renderSpecs.length; j += 1) {
                const spec = renderSpecs[j];
                // all inner items has its own zIndex Queue
                view._addContext();
                view._renderNode(spec.node, spec.x, spec.y);
                view._currentQueue.render(view);
                view._removeContext();
            }
        }
    }

    hitTest(offsetX: number, offsetY: number, view: CanvasView): CanvasElement | undefined {
        if (this.empty) {
            return;
        }
        let queue;
        let zIndexes = Array.from(this.queue.keys());
        zIndexes.sort();
        for (let i = zIndexes.length - 1; i >= 0 ; i--) {
            let zIndex = zIndexes[i];
            let renderSpecs = this.queue.get(zIndex)!;
            for (let j = renderSpecs.length - 1; j >= 0; j--) {
                const spec = renderSpecs[j];
                // all inner items has its own zIndex Queue
                queue = new ZIndexQueue();
                // must execute to fill ZIndexQueue
                let foundTarget = view._hitTest(offsetX, offsetY, spec.node, spec.x, spec.y, queue);
                let queueFoundTarget = queue.hitTest(offsetX, offsetY, view);
                return queueFoundTarget ? queueFoundTarget : foundTarget;
            }
        }
    }
}
