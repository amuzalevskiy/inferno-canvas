import { ILayoutNode } from "./node";
export declare const mapEventType: {
    click: number;
    mousedown: number;
    mousemove: number;
    mouseup: number;
};
export declare function bubbleEvent(e: Event, type: string, node: ILayoutNode): void;
export declare class LayoutEvent {
    originalEvent: Event;
    cancelBubble: boolean;
    readonly target: ILayoutNode;
    currentTarget: ILayoutNode;
    readonly type: string;
    constructor(originalEvent: Event, type: string, target: ILayoutNode, bubbles?: boolean);
    stopPropagation(): void;
    get defaultPrevented(): boolean;
    preventDefault(): void;
}
