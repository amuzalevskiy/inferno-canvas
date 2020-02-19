import { YogaNode, YogaFlexDirection, YogaJustifyContent, YogaAlign, YogaPositionType, YogaFlexWrap, YogaOverflow, YogaDisplay } from "yoga-layout";
import { IStyleProps, TEXT_ALIGN, VERTICAL_ALIGN, ILayoutNode } from "./node";
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
export declare class CanvasElement implements ILayoutNode {
    readonly nodeName: string;
    constructor(nodeName: string);
    free(): void;
    parentNode?: CanvasElement;
    _yogaNode: YogaNode;
    children: CanvasElement[] | undefined;
    style: Style;
    content?: string;
    _doc: any;
    set innerHTML(value: string);
    set textContent(value: string);
    _setDoc(doc: any): void;
    setAttribute(name: string, value: any): void;
    removeAttribute(name: string): void;
    appendChild(child: CanvasElement): void;
    insertBefore(newNode: CanvasElement, nextNode: CanvasElement): void;
    replaceChild(newDom: CanvasElement, lastDom: CanvasElement): void;
    removeChild(childNode: CanvasElement): void;
    $EV?: {
        [name: string]: () => any;
    };
    addEventListener(name: string, fn: () => any): void;
    removeEventListener(name: string, fn: () => any): void;
}
export {};
