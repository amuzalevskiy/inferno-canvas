import { CanvasElement } from "./CanvasElement";

export class CanvasElementRegistry {
  private nodeCleanupQueue: Map<CanvasElement, boolean> = new Map();
  removeNodeFromCleanupQueue(node: CanvasElement) {
    this.nodeCleanupQueue.delete(node);
  }
  addNodeToCleanupQueue(node: CanvasElement) {
    this.nodeCleanupQueue.set(node, true);
  }
  cleanup() {
    this.nodeCleanupQueue.forEach((_unused: boolean, node: CanvasElement) => {
      node.free();
    });
    this.nodeCleanupQueue = new Map();
  }
}