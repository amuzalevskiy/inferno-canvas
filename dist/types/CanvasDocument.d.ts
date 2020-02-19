import { AnimationFrameHandler } from './AnimationFrameHandler';
export declare class CanvasDocument {
    eventCounter: {
        [eventName: string]: number;
    };
    dirty: boolean;
    readonly animationFrameHandler: AnimationFrameHandler;
    constructor(animationFrameHandler: AnimationFrameHandler);
    markDirty(): void;
    addEvent(name: string): void;
    removeEvent(name: string): void;
}
