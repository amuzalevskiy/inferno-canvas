import YogaLayout, {
    YogaJustifyContent,
    YogaAlign,
    YogaFlexDirection,
    YogaFlexWrap,
    YogaDisplay,
    YogaOverflow,
    YogaPositionType,
} from 'yoga-layout';
const {
    JUSTIFY_CENTER,
    JUSTIFY_FLEX_END,
    JUSTIFY_FLEX_START,
    JUSTIFY_SPACE_AROUND,
    JUSTIFY_SPACE_BETWEEN,
    JUSTIFY_SPACE_EVENLY,

    ALIGN_AUTO,
    ALIGN_BASELINE,
    ALIGN_CENTER,
    ALIGN_FLEX_END,
    ALIGN_FLEX_START,
    ALIGN_SPACE_AROUND,
    ALIGN_SPACE_BETWEEN,
    ALIGN_STRETCH,

    FLEX_DIRECTION_COLUMN,
    FLEX_DIRECTION_COLUMN_REVERSE,
    FLEX_DIRECTION_ROW,
    FLEX_DIRECTION_ROW_REVERSE,

    WRAP_NO_WRAP,
    WRAP_WRAP,
    WRAP_WRAP_REVERSE,

    DISPLAY_FLEX,
    DISPLAY_NONE,

    OVERFLOW_HIDDEN,
    OVERFLOW_SCROLL,
    OVERFLOW_VISIBLE,

    POSITION_TYPE_ABSOLUTE,
    POSITION_TYPE_RELATIVE,
} = YogaLayout;

export type FlexDirectionString = 'column-reverse' | 'row' | 'row-reverse' | 'column';
export function convertFlexDirection(value: FlexDirectionString): YogaFlexDirection {
    switch(value) {
        case 'column-reverse': return FLEX_DIRECTION_COLUMN_REVERSE;
        case 'row': return FLEX_DIRECTION_ROW;
        case 'row-reverse': return FLEX_DIRECTION_ROW_REVERSE;
        default: return FLEX_DIRECTION_COLUMN;
    }
}


export type JustifyContentString = 'center' | 'flex-end' | 'flex-start' | 'space-between' | 'space-around' | 'space-evenly';
export function convertJustifyContent(value: JustifyContentString): YogaJustifyContent {
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

export function convertAlign(value: string, defaultValue: YogaAlign): YogaAlign {
    switch(value) {
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

export function convertPositionType(value: string): YogaPositionType {
    switch(value) {
        case 'absolute': return POSITION_TYPE_ABSOLUTE;
        default: return POSITION_TYPE_RELATIVE;
    }
}

export function convertFlexWrap(value: string): YogaFlexWrap {
    switch(value) {
        case 'wrap': return WRAP_WRAP;
        case 'wrap-reverse': return WRAP_WRAP_REVERSE;
        default: return WRAP_NO_WRAP;
    }

}

export function convertOverflow(value: string): YogaOverflow {
    switch(value) {
        case 'hidden': return OVERFLOW_HIDDEN;
        case 'scroll': return OVERFLOW_SCROLL;
        default: return OVERFLOW_VISIBLE;
    }

}

export function convertDisplay(value: string): YogaDisplay {
    switch(value) {
        case 'none': return DISPLAY_NONE;
        default: return DISPLAY_FLEX;
    }
}
