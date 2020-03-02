export declare class TextureAtlas {
    readonly canvas: HTMLCanvasElement;
    readonly context2d: CanvasRenderingContext2D;
    private readonly allocator;
    constructor(initialWidth?: number, initialHeight?: number);
    allocate(width: number, height: number): TextureAtlasRegion;
    private grow;
}
export declare class TextureAtlasRegion {
    readonly canvas: HTMLCanvasElement;
    readonly context2d: CanvasRenderingContext2D;
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
    private readonly rect;
    private destroyed;
    constructor(canvas: HTMLCanvasElement, context2d: CanvasRenderingContext2D, rect: TextureAtlasAllocatorRect, left: number, top: number, width: number, height: number);
    idDestroyed(): boolean;
    setFree(): void;
}
declare class TextureAtlasAllocator {
    readonly width: number;
    readonly height: number;
    private rectsByWidth;
    private rectsByHeight;
    constructor(width: number, height: number);
    register(rects: TextureAtlasAllocatorRect | TextureAtlasAllocatorRect[]): void;
    unregister(rects: TextureAtlasAllocatorRect | TextureAtlasAllocatorRect[]): void;
    /**
     * Allocates region which size exceeds provided width and height
     *
     * This logic leaves unusable piece with minimal possible square
     */
    allocate(width: number, height: number): TextureAtlasAllocatorRect | null;
}
declare class TextureAtlasAllocatorRect {
    private allocator;
    private parent;
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
    readonly square: number;
    used: boolean;
    children?: TextureAtlasAllocatorRect[];
    constructor(allocator: TextureAtlasAllocator, parent: TextureAtlasAllocatorRect | null, left: number, top: number, width: number, height: number);
    estimateAllocation(width: number, height: number): number;
    allocate(width: number, height: number): TextureAtlasAllocatorRect;
    private allocateDivideWidth;
    private allocateDivideHeight;
    setUsed(): void;
    setFree(): void;
    private childSetFree;
}
export {};
