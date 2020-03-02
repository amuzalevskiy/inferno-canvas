import { YogaNode, YogaFlexDirection, YogaJustifyContent, YogaAlign, YogaPositionType, YogaFlexWrap, YogaOverflow, YogaDisplay } from "yoga-layout";
import { IStyleProps, TEXT_ALIGN, VERTICAL_ALIGN, ILayoutNode } from "./node";
import { CanvasElementRegistry } from "./CanvasElementRegistry";
import { CanvasViewEvent } from "./CanvasViewEvent";
import { TextureAtlasRegion } from "./TextureAtlas";
declare class Style implements IStyleProps {
    el: CanvasElement;
    flex?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    height?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    aspectRatio?: number;
    top?: number | string;
    left?: number | string;
    bottom?: number | string;
    right?: number | string;
    margin?: number | string;
    marginTop?: number | string;
    marginLeft?: number | string;
    marginBottom?: number | string;
    marginRight?: number | string;
    marginStart?: number | string;
    marginEnd?: number | string;
    marginVertical?: number | string;
    marginHorizontal?: number | string;
    padding?: number | string;
    paddingTop?: number | string;
    paddingLeft?: number | string;
    paddingBottom?: number | string;
    paddingRight?: number | string;
    paddingStart?: number | string;
    paddingEnd?: number | string;
    paddingVertical?: number | string;
    paddingHorizontal?: number | string;
    border?: number;
    borderStart?: number;
    borderEnd?: number;
    borderTop?: number;
    borderLeft?: number;
    borderBottom?: number;
    borderRight?: number;
    zIndex?: number;
    borderRadius?: number;
    borderColor?: string;
    background?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    font?: string;
    fontSize?: number;
    color?: string;
    textOverflow?: string;
    lineHeight?: number;
    maxLines?: number;
    backgroundImage?: string;
    backgroundPositionX?: number;
    backgroundPositionY?: number;
    flexDirection?: YogaFlexDirection;
    justifyContent?: YogaJustifyContent;
    alignContent?: YogaAlign;
    alignItems?: YogaAlign;
    alignSelf?: YogaAlign;
    position?: YogaPositionType;
    flexWrap?: YogaFlexWrap;
    overflow?: YogaOverflow;
    display?: YogaDisplay;
    textAlign?: TEXT_ALIGN;
    verticalAlign?: VERTICAL_ALIGN;
    _fullFont?: string;
    constructor(el: CanvasElement);
    isMeasureFunctionSet: boolean;
    isTextNode: boolean;
    removeProperty(name: string): void;
    setProperty(name: string, value: any): void;
    setIsTextNode(isTextNode: boolean): void;
    validateMeasureFun(): void;
    createMeasureFunction(node: CanvasElement): (width: number, widthMode: number, height: number, heightMode: number) => {
        width: number;
        height: number;
    };
}
export declare const HAS_CHILDREN = 1;
export declare const HAS_BORDER = 2;
export declare const HAS_BACKGROUND = 4;
export declare const HAS_SHADOW = 8;
export declare const HAS_BACKGROUND_IMAGE = 16;
export declare const HAS_CLIPPING = 32;
export declare const HAS_BORDER_RADIUS = 64;
export declare const SKIP = 128;
export declare const HAS_TEXT = 256;
export declare const FORCE_CACHE = 512;
export declare class CanvasElement implements ILayoutNode {
    readonly registry: CanvasElementRegistry;
    readonly nodeName: string;
    _flagsDirty: boolean;
    _childrenLength: number;
    private _flags;
    _isAbsolute: boolean;
    _dirty: boolean;
    $cache: boolean;
    _cachedRender: TextureAtlasRegion | null;
    constructor(nodeName: string, registry: CanvasElementRegistry);
    markDirty(): void;
    getFlags(): number;
    forceCache(enabled: boolean): void;
    free(): void;
    _freeResourcesRecursive(): void;
    parentNode?: CanvasElement;
    _yogaNode: YogaNode;
    children: CanvasElement[] | undefined;
    style: Style;
    content?: string;
    _doc: any;
    $EV?: {
        [name: string]: (ev: CanvasViewEvent) => any;
    };
    set innerHTML(value: string);
    set textContent(value: string);
    _setDoc(doc: any): void;
    setAttribute(name: string, value: any): void;
    removeAttribute(name: string): void;
    appendChild(child: CanvasElement): void;
    insertBefore(newNode: CanvasElement, nextNode: CanvasElement): void;
    replaceChild(newDom: CanvasElement, lastDom: CanvasElement): void;
    removeChild(childNode: CanvasElement): void;
    addEventListener(name: string, fn: () => any): void;
    removeEventListener(name: string, fn: () => any): void;
    /**
     * Verify that child is detached
     */
    private _verifyElementDetached;
}
export {};
