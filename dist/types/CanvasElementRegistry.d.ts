import { CanvasElement } from "./CanvasElement";
export declare class CanvasElementRegistry {
    private nodeCleanupQueue;
    removeNodeFromCleanupQueue(node: CanvasElement): void;
    addNodeToCleanupQueue(node: CanvasElement): void;
    cleanup(): void;
}
