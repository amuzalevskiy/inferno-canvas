export interface Renderable{
    render(): any;
}
const map = new Map<Promise<Renderable>, Array<Renderable>>();
let queue: Array<Renderable> = [];
let animationFrameRequested = false;
function renderAll() {
    for (let i = 0; i < queue.length; i += 1) {
        queue[i].render();
    }
    queue = [];
    animationFrameRequested = false;
}

export const renderQueue = {
    enqueue: function(renderable: Renderable) {
        if (queue.indexOf(renderable) !== -1) {
            return;
        }
        queue.push(renderable);
        if (!animationFrameRequested) {
            requestAnimationFrame(renderAll);
            animationFrameRequested = true;
        }
    },
    renderAfter: function(renderable: Renderable, promise: Promise<any>) {
        let linked = map.get(promise);
        if (!linked) {
            linked = [];
            map.set(promise, linked);
        }
        if (linked.length === 0) {
            // plan rendering
            promise.then(() => {
                for (let i = 0; i < linked!.length; i += 1) {
                    this.enqueue(linked![i]);
                }
                map.delete(promise);
            }, () => {
                // nothing to render
                // for now there is no fallback supported
                // so just skip
                map.delete(promise);
            });
        }
        if (linked.indexOf(renderable) !== -1) {
            // already linked
            return;
        }
        linked.push(renderable);
    }
};
