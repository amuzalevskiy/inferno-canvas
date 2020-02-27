"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BasketsCache_1 = require("./BasketsCache");
exports.TEXT_ALIGN_LEFT = 0;
exports.TEXT_ALIGN_CENTER = 1;
exports.TEXT_ALIGN_RIGHT = 2;
exports.VERTICAL_ALIGN_TOP = 0;
exports.VERTICAL_ALIGN_MIDDLE = 1;
exports.VERTICAL_ALIGN_BOTTOM = 2;
var SPACES_REGEXP = /\s+/;
function renderText(ctx, cachedContext, text, left, top, width, height, textAlign, verticalAlign, ellipsisChar, cacheNode) {
    var x, y;
    switch (textAlign) {
        case exports.TEXT_ALIGN_RIGHT:
            x = left + width;
            cachedContext.setTextAlign("right");
            break;
        case exports.TEXT_ALIGN_CENTER:
            x = left + width / 2;
            cachedContext.setTextAlign("center");
            break;
        default:
            x = left;
            cachedContext.setTextAlign("left");
            break;
    }
    switch (verticalAlign) {
        case exports.VERTICAL_ALIGN_MIDDLE:
            y = top + height / 2;
            cachedContext.setTextBaseline("middle");
            break;
        case exports.VERTICAL_ALIGN_BOTTOM:
            y = top + height;
            cachedContext.setTextBaseline("bottom");
            break;
        default:
            y = top;
            cachedContext.setTextBaseline("top");
            break;
    }
    if (ellipsisChar) {
        if (cacheNode) {
            if (cacheNode.cache && cacheNode.cache.width === width && cacheNode.cache.text === text) {
                text = cacheNode.cache.value;
            }
            else {
                var cache = {
                    width: width,
                    text: text,
                    value: ""
                };
                text = endWithEllipsis(ctx, cachedContext, "", text.split(SPACES_REGEXP), 0, width, ellipsisChar);
                cache.value = text;
                cacheNode.cache = cache;
            }
        }
        else {
            text = endWithEllipsis(ctx, cachedContext, "", text.split(SPACES_REGEXP), 0, width, ellipsisChar);
        }
    }
    ctx.fillText(text, x, y);
}
exports.renderText = renderText;
function endWithEllipsis(ctx, cachedContext, text, words, i, maxWidth, ellipsisChar) {
    var textWidth = text.length === 0 ? 0 : measureText(cachedContext.font, text).width;
    // add words while textWidth < maxWidth
    while (textWidth < maxWidth && i < words.length) {
        text += (text.length > 0 ? " " : "") + words[i];
        i++;
        textWidth = measureText(cachedContext.font, text).width;
    }
    if (textWidth > maxWidth) {
        while (textWidth > maxWidth) {
            text = text.substr(0, text.length - 1);
            while (text[text.length - 1] === " ") {
                text = text.substr(0, text.length - 1);
            }
            if (text === '') {
                return ellipsisChar;
            }
            textWidth = measureText(cachedContext.font, text + ellipsisChar).width;
        }
        return text + ellipsisChar;
    }
    return text;
}
// caches
var _measureContext;
var _measureContextFont;
function createMeasureContext() {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", "1px");
    canvas.setAttribute("height", "1px");
    return canvas.getContext("2d");
}
var measureTextCache = new BasketsCache_1.BasketsCache({
    basketLifetime: 1500,
    maxBaskets: 4
});
function measureText(font, content) {
    // don't join font and content
    // so algo will be less memory hungry
    var cacheObj = measureTextCache.get(content);
    if (!cacheObj) {
        cacheObj = {};
        measureTextCache.set(content, cacheObj);
    }
    if (cacheObj[font]) {
        return cacheObj[font];
    }
    if (!_measureContext) {
        _measureContext = createMeasureContext();
    }
    // micro-optimization, 0.3% speedup
    if (_measureContextFont !== font) {
        _measureContextFont = font;
        _measureContext.font = font;
    }
    var result = _measureContext.measureText(content);
    cacheObj[font] = result;
    return result;
}
exports.measureText = measureText;
function countLines(text, font, maxWidth, maxLines) {
    var words = text.split(SPACES_REGEXP);
    var linesCount = 0;
    var currentLine = words[0];
    var i;
    for (i = 1; i < words.length; i++) {
        var nextLine = currentLine + (currentLine.length ? " " : "") + words[i];
        if (maxWidth < measureText(font, nextLine).width) {
            linesCount++;
            if (linesCount >= maxLines) {
                return linesCount;
            }
            currentLine = words[i];
        }
        else {
            currentLine = nextLine;
        }
    }
    if (currentLine !== "") {
        linesCount++;
    }
    return linesCount;
}
exports.countLines = countLines;
function renderMultilineText(ctx, cachedContext, text, left, top, width, height, lineHeight, textAlign, verticalAlign, maxLines, ellipsisChar) {
    if (maxLines === void 0) { maxLines = Infinity; }
    var words = text.split(SPACES_REGEXP);
    var lines = [];
    var currentLine = words[0];
    var i;
    for (i = 1; i < words.length; i++) {
        var nextLine = currentLine + (currentLine.length ? " " : "") + words[i];
        if (width < measureText(ctx.font, nextLine).width) {
            lines.push(currentLine);
            if (lines.length >= maxLines) {
                if (ellipsisChar) {
                    lines.push(endWithEllipsis(ctx, cachedContext, lines.pop(), words, i, width, ellipsisChar));
                }
                currentLine = "";
                break;
            }
            currentLine = words[i];
        }
        else {
            currentLine = nextLine;
        }
    }
    if (currentLine !== "") {
        lines.push(currentLine);
    }
    var startX;
    switch (verticalAlign) {
        case exports.VERTICAL_ALIGN_TOP:
            startX = top;
            break;
        case exports.VERTICAL_ALIGN_BOTTOM:
            startX = top + height - lines.length * lineHeight;
            ctx.textBaseline = "bottom";
            break;
        default:
            startX = top + (height - lines.length * lineHeight) / 2;
            ctx.textBaseline = "middle";
            break;
    }
    for (i = 0; i < lines.length; i++) {
        renderText(ctx, cachedContext, lines[i], left, startX, width, lineHeight, textAlign, verticalAlign);
        startX += lineHeight;
    }
}
exports.renderMultilineText = renderMultilineText;
function innerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight) {
    var layoutRight = layoutLeft + layoutWidth;
    var layoutBottom = layoutTop + layoutHeight;
    var radius = Math.min(borderRadius, layoutWidth / 2, layoutHeight / 2);
    /**
     * OPTIMIZE FOR RADIUS = 0
     */
    if (radius <= 0) {
        ctx.moveTo(layoutLeft + borderLeft, layoutTop + borderTop);
        ctx.lineTo(layoutRight - borderRight, layoutTop + borderTop);
        ctx.lineTo(layoutRight - borderRight, layoutBottom - borderBottom);
        ctx.lineTo(layoutLeft + borderLeft, layoutBottom - borderBottom);
        ctx.lineTo(layoutLeft + borderLeft, layoutTop + borderTop);
        return;
    }
    var radiusTopLeft = Math.max(0, radius - Math.max(borderTop, borderLeft));
    var radiusTopRight = Math.max(0, radius - Math.max(borderTop, borderRight));
    var radiusBottomRight = Math.max(0, radius - Math.max(borderBottom, borderRight));
    var radiusBottomLeft = Math.max(0, radius - Math.max(borderBottom, borderLeft));
    ctx.lineWidth = 1;
    ctx.moveTo(layoutLeft + radiusTopLeft + borderLeft, layoutTop + borderTop);
    ctx.lineTo(layoutRight - radiusTopRight - borderRight, layoutTop + borderTop);
    radiusTopRight &&
        ctx.arcTo(layoutRight - borderRight, layoutTop + borderTop, layoutRight - borderRight, layoutTop + radius, radiusTopRight);
    ctx.lineTo(layoutRight - borderRight, layoutBottom - radiusBottomRight - borderBottom);
    radiusBottomRight &&
        ctx.arcTo(layoutRight - borderRight, layoutBottom - borderBottom, layoutRight - radius, layoutBottom - borderBottom, radiusBottomRight);
    ctx.lineTo(layoutLeft + radiusBottomLeft + borderLeft, layoutBottom - borderBottom);
    radiusBottomLeft &&
        ctx.arcTo(layoutLeft + borderLeft, layoutBottom - borderBottom, layoutLeft + borderLeft, layoutBottom - radius, radiusBottomLeft);
    ctx.lineTo(layoutLeft + borderLeft, layoutTop + radiusTopLeft + borderTop);
    radiusTopLeft &&
        ctx.arcTo(layoutLeft + borderLeft, layoutTop + borderTop, layoutLeft + radius, layoutTop + borderTop, radiusTopLeft);
}
function outerBorderPath(ctx, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight, preferMove) {
    var layoutRight = layoutLeft + layoutWidth, layoutBottom = layoutTop + layoutHeight;
    var radius = Math.min(borderRadius, layoutWidth / 2, layoutHeight / 2);
    // outerPath in backwards order
    if (radius <= 0) {
        if (preferMove) {
            ctx.moveTo(layoutLeft, layoutTop);
        }
        else {
            ctx.lineTo(layoutLeft, layoutTop);
        }
        ctx.lineTo(layoutLeft, layoutBottom);
        ctx.lineTo(layoutRight, layoutBottom);
        ctx.lineTo(layoutRight, layoutTop);
        ctx.lineTo(layoutLeft, layoutTop);
        return;
    }
    if (preferMove) {
        ctx.moveTo(layoutLeft + radius, layoutTop);
    }
    else {
        ctx.lineTo(layoutLeft + radius, layoutTop);
    }
    ctx.arcTo(layoutLeft, layoutTop, layoutLeft, layoutTop + radius, radius);
    ctx.lineTo(layoutLeft, layoutBottom - radius);
    ctx.arcTo(layoutLeft, layoutBottom, layoutLeft + radius, layoutBottom, radius);
    ctx.lineTo(layoutRight - radius, layoutBottom);
    ctx.arcTo(layoutRight, layoutBottom, layoutRight, layoutBottom - radius, radius);
    ctx.lineTo(layoutRight, layoutTop + radius);
    ctx.arcTo(layoutRight, layoutTop, layoutRight - radius, layoutTop, radius);
    ctx.lineTo(layoutLeft + radius, layoutTop);
}
exports.outerBorderPath = outerBorderPath;
function createBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight) {
    var radius = Math.min(borderRadius, layoutWidth / 2, layoutHeight / 2);
    if (radius < 0) {
        radius = 0;
    }
    ctx.beginPath();
    // innerPath
    innerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    outerBorderPath(ctx, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight, false);
}
exports.createBorderPath = createBorderPath;
function closedInnerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight) {
    var radius = Math.floor(Math.min(borderRadius, layoutWidth / 2, layoutHeight / 2));
    if (radius === 0) {
        ctx.beginPath();
        ctx.rect(layoutLeft + borderLeft, layoutTop + borderTop, layoutWidth - borderLeft - borderRight, layoutHeight - borderTop - borderBottom);
    }
    else {
        ctx.beginPath();
        innerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
    }
}
exports.closedInnerBorderPath = closedInnerBorderPath;
//# sourceMappingURL=renderUtils.js.map