"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var convertStringToYogaConst_1 = require("./convertStringToYogaConst");
var node_1 = require("./node");
var renderUtils_1 = require("./renderUtils");
var yoga_layout_1 = require("yoga-layout");
var ALIGN_STRETCH = yoga_layout_1.default.ALIGN_STRETCH, ALIGN_AUTO = yoga_layout_1.default.ALIGN_AUTO;
function parseTextAlign(value) {
    switch (value) {
        case "left":
            return renderUtils_1.TEXT_ALIGN_LEFT;
        case "center":
            return node_1.TEXT_ALIGN_CENTER;
        case "right":
            return node_1.TEXT_ALIGN_RIGHT;
    }
    return renderUtils_1.TEXT_ALIGN_LEFT;
}
exports.parseTextAlign = parseTextAlign;
function parseVerticalAlign(value) {
    switch (value) {
        case "top":
            return renderUtils_1.VERTICAL_ALIGN_TOP;
        case "bottom":
            return node_1.VERTICAL_ALIGN_BOTTOM;
        case "middle":
            return node_1.VERTICAL_ALIGN_MIDDLE;
    }
    return renderUtils_1.VERTICAL_ALIGN_TOP;
}
exports.parseVerticalAlign = parseVerticalAlign;
// export const defaultStyle: IStyleProps = {
//   width: "auto",
//   height: "auto",
//   justifyContent: JUSTIFY_FLEX_START,
//   alignItems: ALIGN_STRETCH,
//   alignSelf: ALIGN_AUTO,
//   alignContent: ALIGN_STRETCH,
//   flexDirection: FLEX_DIRECTION_COLUMN,
//   padding: 0,
//   paddingTop: 0,
//   paddingLeft: 0,
//   paddingBottom: 0,
//   paddingRight: 0,
//   paddingHorizontal: 0,
//   paddingVertical: 0,
//   paddingStart: 0,
//   paddingEnd: 0,
//   margin: 0,
//   marginTop: 0,
//   marginLeft: 0,
//   marginBottom: 0,
//   marginRight: 0,
//   marginStart: 0,
//   marginEnd: 0,
//   marginVertical: 0,
//   marginHorizontal: 0,
//   border: 0,
//   borderStart: 0,
//   borderEnd: 0,
//   borderTop: 0,
//   borderLeft: 0,
//   borderBottom: 0,
//   borderRight: 0,
//   position: POSITION_TYPE_RELATIVE,
//   flexWrap: WRAP_NO_WRAP,
//   flexBasis: "auto",
//   flexGrow: 0,
//   flexShrink: 1,
//   overflow: OVERFLOW_VISIBLE,
//   display: DISPLAY_FLEX,
//   background: "transparent",
//   font: "serif",
//   fontSize: 10,
//   color: "#000000",
//   borderRadius: 0,
//   textAlign: TEXT_ALIGN_LEFT,
//   verticalAlign: VERTICAL_ALIGN_TOP,
//   shadowColor: "transparent",
//   shadowBlur: 0,
//   shadowOffsetX: 0,
//   shadowOffsetY: 0
// };
function parseStyle(style) {
    if (!style) {
        return {};
    }
    if (Array.isArray(style)) {
        switch (style.length) {
            case 0:
                return {};
            case 1:
                return parseStyleImpl(style[0]);
            default:
                return mergeStyle(style);
        }
    }
    return parseStyleImpl(style);
}
exports.parseStyle = parseStyle;
function mergeStyle(styles) {
    var style = {};
    for (var i = 0; i < styles.length; i += 1) {
        var toCopy = parseStyle(styles[i]);
        for (var key in toCopy) {
            style[key] = toCopy[key];
        }
    }
    return style;
}
// tslint:disable:strict-type-predicates
function parseStyleImpl(style) {
    if (style["$parsed"]) {
        // optimization hack...
        // this object is already parsed...
        return style;
    }
    Object.defineProperty(style, "$parsed", {
        value: true,
        enumerable: false // prevent from copying
    });
    var parsed = style;
    if (style.flexDirection !== undefined && typeof style.flexDirection !== 'number') {
        parsed.flexDirection = convertStringToYogaConst_1.convertFlexDirection(style.flexDirection);
    }
    if (style.justifyContent !== undefined && typeof style.justifyContent !== 'number') {
        parsed.justifyContent = convertStringToYogaConst_1.convertJustifyContent(style.justifyContent);
    }
    if (style.alignContent !== undefined && typeof style.alignContent !== 'number') {
        parsed.alignContent = convertStringToYogaConst_1.convertAlign(style.alignContent, ALIGN_STRETCH);
    }
    if (style.alignItems !== undefined && typeof style.alignItems !== 'number') {
        parsed.alignItems = convertStringToYogaConst_1.convertAlign(style.alignItems, ALIGN_STRETCH);
    }
    if (style.alignSelf !== undefined && typeof style.alignSelf !== 'number') {
        parsed.alignSelf = convertStringToYogaConst_1.convertAlign(style.alignSelf, ALIGN_AUTO);
    }
    if (style.position !== undefined && typeof style.position !== 'number') {
        parsed.position = convertStringToYogaConst_1.convertPositionType(style.position);
    }
    if (style.flexWrap !== undefined && typeof style.flexWrap !== 'number') {
        parsed.flexWrap = convertStringToYogaConst_1.convertFlexWrap(style.flexWrap);
    }
    if (style.overflow !== undefined && typeof style.overflow !== 'number') {
        parsed.overflow = convertStringToYogaConst_1.convertOverflow(style.overflow);
    }
    if (style.display !== undefined && typeof style.display !== 'number') {
        parsed.display = convertStringToYogaConst_1.convertDisplay(style.display);
    }
    if (style.textAlign !== undefined && typeof style.textAlign !== 'number') {
        parsed.textAlign = parseTextAlign(style.textAlign);
    }
    if (style.verticalAlign !== undefined && typeof style.verticalAlign !== 'number') {
        parsed.verticalAlign = parseVerticalAlign(style.verticalAlign);
    }
    return parsed;
}
//# sourceMappingURL=parseStyle.js.map