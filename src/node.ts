import {
  YogaNode,
  YogaFlexDirection,
  YogaJustifyContent,
  YogaAlign,
  YogaPositionType,
  YogaFlexWrap,
  YogaOverflow,
  YogaDisplay
} from "yoga-layout";
import { LayoutEvent } from "./LayoutEvent";
import { FlexDirectionString, JustifyContentString } from "./convertStringToYogaConst";

export const TEXT_ALIGN_LEFT = 0;
export const TEXT_ALIGN_CENTER = 1;
export const TEXT_ALIGN_RIGHT = 2;
export const VERTICAL_ALIGN_TOP = 0;
export const VERTICAL_ALIGN_MIDDLE = 1;
export const VERTICAL_ALIGN_BOTTOM = 2;
export type TEXT_ALIGN =
  | typeof TEXT_ALIGN_LEFT
  | typeof TEXT_ALIGN_CENTER
  | typeof TEXT_ALIGN_RIGHT;
export type VERTICAL_ALIGN =
  | typeof VERTICAL_ALIGN_TOP
  | typeof VERTICAL_ALIGN_MIDDLE
  | typeof VERTICAL_ALIGN_BOTTOM;

interface IBaseProps {
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
  // box
  zIndex?: number;
  borderRadius?: number;
  borderColor?: string;
  background?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  // text node
  font?: string;
  fontSize?: number;
  color?: string;
  textOverflow?: string;
  lineHeight?: number;
  maxLines?: number;
  // image
  backgroundImage?: string;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
}
export interface IStyleProps extends IBaseProps {
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
}
export interface IStyleDefinition extends IBaseProps {
  flexDirection?: FlexDirectionString;
  justifyContent?: JustifyContentString;
  alignContent?: string;
  alignItems?: string;
  alignSelf?: string;
  position?: string;
  flexWrap?: string;
  overflow?: string;
  display?: string;
  textAlign?: string;
  verticalAlign?: string;
}
export interface INode {
  type?: string;
  style?: IStyleDefinition | Array<IStyleDefinition>;
  children?: Array<INode>;
  content?: string;
  maxLines?: number;
  onClick?: (e: LayoutEvent) => void;
  onDoubleClick?: (e: LayoutEvent) => void;
  onMouseDown?: (e: LayoutEvent) => void;
  onMouseMove?: (e: LayoutEvent) => void;
  onMouseUp?: (e: LayoutEvent) => void;
  onMouseEnter?: (e: LayoutEvent) => void;
  onMouseLeave?: (e: LayoutEvent) => void;
}
export interface ILayoutNode {
  parentNode?: ILayoutNode;
  _yogaNode: YogaNode;
  style: IStyleProps;
  children?: Array<ILayoutNode>;
  content?: string;
  $EV?: {
    [eventName: string]: (event: LayoutEvent) => void | undefined
  }
}
export interface IRect {
    left: number;
    top: number;
    width: number;
    height: number;
}
export interface IRenderSpec {
  node: ILayoutNode;
  x: number;
  y: number;
}
