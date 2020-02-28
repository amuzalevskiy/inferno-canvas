import { CanvasElement } from "./CanvasElement";
export declare const mapEventType: {
    click: number;
    mousedown: number;
    mousemove: number;
    mouseup: number;
};
export declare function bubbleEvent(e: Event, type: string, node: CanvasElement): void;
export declare class CanvasViewEvent {
    originalEvent: Event;
    cancelBubble: boolean;
    readonly target: CanvasElement;
    currentTarget: CanvasElement;
    readonly type: string;
    constructor(originalEvent: Event, type: string, target: CanvasElement, bubbles?: boolean);
    stopPropagation(): void;
    get defaultPrevented(): boolean;
    preventDefault(): void;
}
