import { SortedArray } from "./SortedArray";

export class TextureAtlas {
    public readonly canvas = document.createElement("canvas");
    public readonly context2d = this.canvas.getContext("2d")!;
    private readonly allocator: TextureAtlasAllocator;
    constructor(initialWidth: number = 512, initialHeight: number = 1024) {
        this.canvas.width = initialWidth;
        this.canvas.height = initialHeight;
        this.allocator = new TextureAtlasAllocator(initialWidth, initialHeight);
    }
    allocate(width: number, height: number) {
        let rect: TextureAtlasAllocatorRect | null = this.allocator.allocate(width, height);
        while (!rect) {
            this.grow();
            rect = this.allocator.allocate(width, height);
        }
        return new TextureAtlasRegion(
            this.canvas,
            this.context2d,
            rect,
            rect.top,
            rect.left,
            width,
            height
        );
    }
    private grow() {
        // always grow in 2 times
        if (this.canvas.width < this.canvas.height) {
            const oldWidth = this.canvas.width;
            this.canvas.width = oldWidth * 2;
            this.allocator.register(new TextureAtlasAllocatorRect(
                this.allocator,
                null,
                oldWidth,
                0,
                oldWidth,
                this.canvas.height
            ));
        } else {
            const oldHeight = this.canvas.height;
            this.canvas.height = oldHeight * 2;
            this.allocator.register(new TextureAtlasAllocatorRect(
                this.allocator,
                null,
                0,
                oldHeight,
                this.canvas.width,
                oldHeight
            ));
        }
        // important to log?
        console.log("texture atlas grow to " + this.canvas.width + "x" + this.canvas.height);
    }
}

export class TextureAtlasRegion {
    public readonly canvas: HTMLCanvasElement;
    public readonly context2d: CanvasRenderingContext2D;
    public readonly left: number;
    public readonly top: number;
    public readonly width: number;
    public readonly height: number;
    private readonly rect: TextureAtlasAllocatorRect;
    private destroyed: boolean = false;
    constructor(canvas: HTMLCanvasElement, context2d: CanvasRenderingContext2D, rect: TextureAtlasAllocatorRect, left: number, top: number, width: number, height: number) {
        this.canvas = canvas;
        this.context2d = context2d;
        this.rect = rect;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    idDestroyed() {
        return this.destroyed;
    }

    setFree() {
        this.rect.setFree();
        this.destroyed = true;
    }
}

class TextureAtlasAllocator {
    public readonly width: number;
    public readonly height: number;
    private rectsByWidth = new SortedArray<TextureAtlasAllocatorRect>("square");
    private rectsByHeight = new SortedArray<TextureAtlasAllocatorRect>("square");
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.register(new TextureAtlasAllocatorRect(this, null, 0, 0, width, height));
    }

    register(rects: TextureAtlasAllocatorRect | TextureAtlasAllocatorRect[]) {
        this.rectsByWidth.insert(rects);
        this.rectsByHeight.insert(rects);
    }

    unregister(rects: TextureAtlasAllocatorRect | TextureAtlasAllocatorRect[]) {
        this.rectsByWidth.removeByValue(rects);
        this.rectsByHeight.removeByValue(rects);
    }

    /**
     * Allocates region which size exceeds provided width and height
     * 
     * This logic leaves unusable piece with minimal possible square
     */
    allocate(width: number, height: number): TextureAtlasAllocatorRect | null {
        let square = width * height;
        let bestMatch: TextureAtlasAllocatorRect | null = null;
        let minimalEstimate = Infinity;
        const totalRects = this.rectsByWidth.length;
        // go by width first
        for (let i = this.rectsByWidth.greaterThan(height, true); i < totalRects; i++) {
            const rectToCheck = this.rectsByWidth.get(i);
            if (rectToCheck.width * height > square + minimalEstimate) {
                // short path
                break;
            }
            const estimate = rectToCheck.estimateAllocation(width, height);
            if (estimate !== -1) {
                if (estimate < minimalEstimate) {
                    minimalEstimate = estimate;
                    bestMatch = rectToCheck;
                }
            }
        }
        // go by height
        for (let i = this.rectsByHeight.greaterThan(height, true); i < totalRects; i++) {
            const rectToCheck = this.rectsByHeight.get(i);
            if (width * rectToCheck.height > square + minimalEstimate) {
                // short path
                break;
            }
            const estimate = rectToCheck.estimateAllocation(width, height);
            if (estimate !== -1) {
                if (estimate < minimalEstimate) {
                    minimalEstimate = estimate;
                    bestMatch = rectToCheck;
                }
            }
        }
        return bestMatch !== null ? bestMatch.allocate(width, height) : null;
    }
}

class TextureAtlasAllocatorRect{
    private allocator: TextureAtlasAllocator;
    private parent: TextureAtlasAllocatorRect | null;
    public readonly left: number;
    public readonly top: number;
    public readonly width: number;
    public readonly height: number;
    public readonly square: number;
    used: boolean = true;
    children?: TextureAtlasAllocatorRect[];

    constructor(allocator: TextureAtlasAllocator, parent: TextureAtlasAllocatorRect | null, left: number, top: number, width: number, height: number) {
        this.allocator = allocator;
        this.parent = parent;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.square = width * height;
    }

    estimateAllocation(width: number, height: number) {
        if (width > this.width || height > this.height) {
            return -1;
        }
        return Math.min(
            (this.width - width) * height,
            width * (this.height - height)
        );
    }

    allocate(width: number, height: number) {
        if (width * height * 1.05 > this.width * this.height) {
            // the sizes almost match...
            // don't divide further...
            this.setUsed();
            return this;
        }
        if ((this.width - width) * height > width * (this.height - height)) {
            return this.allocateDivideWidth(width, height);
        } else {
            return this.allocateDivideHeight(width, height);
        }
    }

    private allocateDivideWidth(width: number, height: number) {
        this.children = [
            new TextureAtlasAllocatorRect(this.allocator, this, this.left, this.top, width, height),
            new TextureAtlasAllocatorRect(this.allocator, this, this.left + width, this.top, (this.width - width), this.height),
            new TextureAtlasAllocatorRect(this.allocator, this, this.left, this.top + height, width, (this.height - height))
        ];
        this.setUsed();
        this.allocator.register([this.children[1], this.children[2]]);
        this.children[0].used = true;
        return this.children[0];
    }

    private allocateDivideHeight(width: number, height: number) {
        this.children = [
            new TextureAtlasAllocatorRect(this.allocator, this, this.left, this.top, width, height),
            new TextureAtlasAllocatorRect(this.allocator, this, this.left + width, this.top, (this.width - width), height),
            new TextureAtlasAllocatorRect(this.allocator, this, this.left, this.top + height, this.width, (this.height - height))
        ];
        this.setUsed();
        this.allocator.register([this.children[1], this.children[2]]);
        this.children[0].used = true;
        return this.children[0];
    }
    setUsed() {
        this.used = true;
        this.allocator.unregister(this);
    }
    setFree() {
        this.used = false;
        this.allocator.register(this);
        if (this.parent) {
            this.parent.childSetFree();
        }
    }
    private childSetFree() {
        for (let i = 0; i < this.children!.length; i++) {
            const child = this.children![i];
            if (child.used) {
                return;
            }
        }
        // all children isFree
        this.allocator.unregister(this.children!);
        this.children = undefined;
        this.setFree();
    }
}
