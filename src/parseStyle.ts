import {
  convertAlign,
  convertDisplay,
  convertFlexDirection,
  convertFlexWrap,
  convertJustifyContent,
  convertOverflow,
  convertPositionType
} from "./convertStringToYogaConst";
import {
  IStyleProps,
  IStyleDefinition, 
  TEXT_ALIGN,
  TEXT_ALIGN_CENTER,
  TEXT_ALIGN_RIGHT,
  VERTICAL_ALIGN,
  VERTICAL_ALIGN_BOTTOM,
  VERTICAL_ALIGN_MIDDLE } from "./node";

import { TEXT_ALIGN_LEFT, VERTICAL_ALIGN_TOP } from "./renderUtils";

import YogaLayout from 'yoga-layout';
const {
  ALIGN_STRETCH,
  ALIGN_AUTO
} = YogaLayout;

export type TEXT_ALIGN_STRING = "left" | "center" | "right";
export function parseTextAlign(value: TEXT_ALIGN_STRING): TEXT_ALIGN {
  switch (value) {
    case "left":
      return TEXT_ALIGN_LEFT;
    case "center":
      return TEXT_ALIGN_CENTER;
    case "right":
      return TEXT_ALIGN_RIGHT;
  }
  return TEXT_ALIGN_LEFT;
}

export type VERTICAL_ALIGN_STRING = "top" | "bottom" | "middle";
export function parseVerticalAlign(value: VERTICAL_ALIGN_STRING): VERTICAL_ALIGN {
  switch (value) {
    case "top":
      return VERTICAL_ALIGN_TOP;
    case "bottom":
      return VERTICAL_ALIGN_BOTTOM;
    case "middle":
      return VERTICAL_ALIGN_MIDDLE;
  }
  return VERTICAL_ALIGN_TOP;
}

export function parseStyle(
  style: IStyleDefinition | IStyleProps | Array<IStyleDefinition | IStyleProps>
): IStyleProps {
  if (!style) {
    return {};
  }
  if (Array.isArray(style)) {
    switch (style.length) {
      case 0:
        return {};
      case 1:
        return parseStyleImpl(style[0] as IStyleDefinition);
      default:
        return mergeStyle(style);
    }
  }
  return parseStyleImpl(style as IStyleDefinition);
}

function mergeStyle(styles: Array<IStyleDefinition | IStyleProps>): IStyleProps {
  var style: IStyleProps = {};
  for (var i = 0; i < styles.length; i += 1) {
    const toCopy = parseStyle(styles[i]);
    for (var key in toCopy) {
      (style as any)[key] = (toCopy as any)[key];
    }
  }
  return style;
}

// tslint:disable:strict-type-predicates
function parseStyleImpl(style: IStyleDefinition): IStyleProps {
  if ((style as any)["$parsed"]) {
    // optimization hack...
    // this object is already parsed...
    return style as any;
  }
  Object.defineProperty(style, "$parsed", {
    value: true,
    enumerable: false // prevent from copying
  });
  
  let parsed: IStyleProps = style as any;

  if (style.flexDirection !== undefined && typeof style.flexDirection !== 'number') {
    parsed.flexDirection = convertFlexDirection(style.flexDirection);
  }
  if (style.justifyContent !== undefined && typeof style.justifyContent !== 'number') {
    parsed.justifyContent = convertJustifyContent(style.justifyContent);
  }
  if (style.alignContent !== undefined && typeof style.alignContent !== 'number') {
    parsed.alignContent = convertAlign(style.alignContent, ALIGN_STRETCH);
  }
  if (style.alignItems !== undefined && typeof style.alignItems !== 'number') {
    parsed.alignItems = convertAlign(style.alignItems, ALIGN_STRETCH);
  }
  if (style.alignSelf !== undefined && typeof style.alignSelf !== 'number') {
    parsed.alignSelf = convertAlign(style.alignSelf, ALIGN_AUTO);
  }
  if (style.position !== undefined && typeof style.position !== 'number') {
    parsed.position = convertPositionType(style.position);
  }
  if (style.flexWrap !== undefined && typeof style.flexWrap !== 'number') {
    parsed.flexWrap = convertFlexWrap(style.flexWrap);
  }
  if (style.overflow !== undefined && typeof style.overflow !== 'number') {
    parsed.overflow = convertOverflow(style.overflow);
  }
  if (style.display !== undefined && typeof style.display !== 'number') {
    parsed.display = convertDisplay(style.display);
  }
  if (style.textAlign !== undefined && typeof style.textAlign !== 'number') {
    parsed.textAlign = parseTextAlign(style.textAlign);
  }
  if (style.verticalAlign !== undefined && typeof style.verticalAlign !== 'number') {
    parsed.verticalAlign = parseVerticalAlign(style.verticalAlign);
  }
  return parsed;
}
