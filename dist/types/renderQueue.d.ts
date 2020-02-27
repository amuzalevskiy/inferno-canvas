export interface Renderable {
    render(): any;
}
export declare const renderQueue: {
    enqueue: (renderable: Renderable) => void;
    renderAfter: (renderable: Renderable, promise: Promise<any>) => void;
};
