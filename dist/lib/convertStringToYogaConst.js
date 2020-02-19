"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yoga_layout_1 = require("yoga-layout");
var JUSTIFY_CENTER = yoga_layout_1.default.JUSTIFY_CENTER, JUSTIFY_FLEX_END = yoga_layout_1.default.JUSTIFY_FLEX_END, JUSTIFY_FLEX_START = yoga_layout_1.default.JUSTIFY_FLEX_START, JUSTIFY_SPACE_AROUND = yoga_layout_1.default.JUSTIFY_SPACE_AROUND, JUSTIFY_SPACE_BETWEEN = yoga_layout_1.default.JUSTIFY_SPACE_BETWEEN, JUSTIFY_SPACE_EVENLY = yoga_layout_1.default.JUSTIFY_SPACE_EVENLY, ALIGN_AUTO = yoga_layout_1.default.ALIGN_AUTO, ALIGN_BASELINE = yoga_layout_1.default.ALIGN_BASELINE, ALIGN_CENTER = yoga_layout_1.default.ALIGN_CENTER, ALIGN_FLEX_END = yoga_layout_1.default.ALIGN_FLEX_END, ALIGN_FLEX_START = yoga_layout_1.default.ALIGN_FLEX_START, ALIGN_SPACE_AROUND = yoga_layout_1.default.ALIGN_SPACE_AROUND, ALIGN_SPACE_BETWEEN = yoga_layout_1.default.ALIGN_SPACE_BETWEEN, ALIGN_STRETCH = yoga_layout_1.default.ALIGN_STRETCH, FLEX_DIRECTION_COLUMN = yoga_layout_1.default.FLEX_DIRECTION_COLUMN, FLEX_DIRECTION_COLUMN_REVERSE = yoga_layout_1.default.FLEX_DIRECTION_COLUMN_REVERSE, FLEX_DIRECTION_ROW = yoga_layout_1.default.FLEX_DIRECTION_ROW, FLEX_DIRECTION_ROW_REVERSE = yoga_layout_1.default.FLEX_DIRECTION_ROW_REVERSE, WRAP_NO_WRAP = yoga_layout_1.default.WRAP_NO_WRAP, WRAP_WRAP = yoga_layout_1.default.WRAP_WRAP, WRAP_WRAP_REVERSE = yoga_layout_1.default.WRAP_WRAP_REVERSE, DISPLAY_FLEX = yoga_layout_1.default.DISPLAY_FLEX, DISPLAY_NONE = yoga_layout_1.default.DISPLAY_NONE, OVERFLOW_HIDDEN = yoga_layout_1.default.OVERFLOW_HIDDEN, OVERFLOW_SCROLL = yoga_layout_1.default.OVERFLOW_SCROLL, OVERFLOW_VISIBLE = yoga_layout_1.default.OVERFLOW_VISIBLE, POSITION_TYPE_ABSOLUTE = yoga_layout_1.default.POSITION_TYPE_ABSOLUTE, POSITION_TYPE_RELATIVE = yoga_layout_1.default.POSITION_TYPE_RELATIVE;
function convertFlexDirection(value) {
    switch (value) {
        case 'column-reverse': return FLEX_DIRECTION_COLUMN_REVERSE;
        case 'row': return FLEX_DIRECTION_ROW;
        case 'row-reverse': return FLEX_DIRECTION_ROW_REVERSE;
        default: return FLEX_DIRECTION_COLUMN;
    }
}
exports.convertFlexDirection = convertFlexDirection;
function convertJustifyContent(value) {
    switch (value) {
        case 'center':
            return JUSTIFY_CENTER;
        case 'flex-end':
            return JUSTIFY_FLEX_END;
        case 'space-between':
            return JUSTIFY_SPACE_AROUND;
        case 'space-around':
            return JUSTIFY_SPACE_BETWEEN;
        case 'space-evenly':
            return JUSTIFY_SPACE_EVENLY;
        case 'flex-start':
        default:
            return JUSTIFY_FLEX_START;
    }
}
exports.convertJustifyContent = convertJustifyContent;
function convertAlign(value, defaultValue) {
    switch (value) {
        case 'auto': return ALIGN_AUTO;
        case 'baseline': return ALIGN_BASELINE;
        case 'center': return ALIGN_CENTER;
        case 'flex-end': return ALIGN_FLEX_END;
        case 'flex-start': return ALIGN_FLEX_START;
        case 'space-around': return ALIGN_SPACE_AROUND;
        case 'space-between': return ALIGN_SPACE_BETWEEN;
        case 'stretch': return ALIGN_STRETCH;
        default: return defaultValue;
    }
}
exports.convertAlign = convertAlign;
function convertPositionType(value) {
    switch (value) {
        case 'absolute': return POSITION_TYPE_ABSOLUTE;
        default: return POSITION_TYPE_RELATIVE;
    }
}
exports.convertPositionType = convertPositionType;
function convertFlexWrap(value) {
    switch (value) {
        case 'wrap': return WRAP_WRAP;
        case 'wrap-reverse': return WRAP_WRAP_REVERSE;
        default: return WRAP_NO_WRAP;
    }
}
exports.convertFlexWrap = convertFlexWrap;
function convertOverflow(value) {
    switch (value) {
        case 'hidden': return OVERFLOW_HIDDEN;
        case 'scroll': return OVERFLOW_SCROLL;
        default: return OVERFLOW_VISIBLE;
    }
}
exports.convertOverflow = convertOverflow;
function convertDisplay(value) {
    switch (value) {
        case 'none': return DISPLAY_NONE;
        default: return DISPLAY_FLEX;
    }
}
exports.convertDisplay = convertDisplay;
//# sourceMappingURL=convertStringToYogaConst.js.map