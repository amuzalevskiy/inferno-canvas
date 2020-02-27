import { BasketsCache } from "./BasketsCache";

export const TEXT_ALIGN_LEFT = 0;
export const TEXT_ALIGN_CENTER = 1;
export const TEXT_ALIGN_RIGHT = 2;

export type TEXT_ALIGN =
  | typeof TEXT_ALIGN_LEFT
  | typeof TEXT_ALIGN_RIGHT
  | typeof TEXT_ALIGN_CENTER;

export const VERTICAL_ALIGN_TOP = 0;
export const VERTICAL_ALIGN_MIDDLE = 1;
export const VERTICAL_ALIGN_BOTTOM = 2;

export type VERTICAL_ALIGN =
  | typeof VERTICAL_ALIGN_TOP
  | typeof VERTICAL_ALIGN_MIDDLE
  | typeof VERTICAL_ALIGN_BOTTOM;

const SPACES_REGEXP = /\s+/;
export function renderText(
  ctx: CanvasRenderingContext2D,
  text: string,
  left: number,
  top: number,
  width: number,
  height: number,
  textAlign?: TEXT_ALIGN,
  verticalAlign?: VERTICAL_ALIGN,
  ellipsisChar?: string,
  cacheNode?: {
    cache?: {
      text: string;
      width: number;
      value: string;
    }
  }
) {
  let x, y;
  switch (textAlign) {
    case TEXT_ALIGN_RIGHT:
      x = left + width;
      ctx.textAlign = "right";
      break;
    case TEXT_ALIGN_CENTER:
      x = left + width / 2;
      ctx.textAlign = "center";
      break;
    default:
      x = left;
      ctx.textAlign = "left";
      break;
  }

  switch (verticalAlign) {
    case VERTICAL_ALIGN_MIDDLE:
      y = top + height / 2;
      ctx.textBaseline = "middle";
      break;
    case VERTICAL_ALIGN_BOTTOM:
      y = top + height;
      ctx.textBaseline = "bottom";
      break;
    default:
      y = top;
      ctx.textBaseline = "top";
      break;
  }
  if (ellipsisChar) {
    if (cacheNode) {
      if( cacheNode.cache && cacheNode.cache.width === width && cacheNode.cache.text === text) {
        text = cacheNode.cache.value;
      } else {
        let cache = {
          width: width,
          text,
          value: ""
        };

        text = endWithEllipsis(
          ctx,
          "",
          text.split(SPACES_REGEXP),
          0,
          width,
          ellipsisChar
        );

        cache.value = text;
        cacheNode.cache = cache;
      }
    } else {
      text = endWithEllipsis(
        ctx,
        "",
        text.split(SPACES_REGEXP),
        0,
        width,
        ellipsisChar
      );
    }
  }
  ctx.fillText(text, x, y);
}

function endWithEllipsis(ctx: CanvasRenderingContext2D, text: string, words: string[], i: number, maxWidth: number, ellipsisChar: string) {
  let textWidth = text.length === 0 ? 0 : measureText(ctx.font, text).width;

  // add words while textWidth < maxWidth
  while (textWidth < maxWidth && i < words.length) {
    text += (text.length > 0 ? " " : "") + words[i];
    i++;
    textWidth = measureText(ctx.font, text).width;
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
      textWidth = measureText(ctx.font, text + ellipsisChar).width;
    }
    return text + ellipsisChar;
  }

  return text;
}

// caches
let _measureContext: CanvasRenderingContext2D;
let _measureContextFont: string;
function createMeasureContext(): CanvasRenderingContext2D {
  let canvas = document.createElement("canvas");
  canvas.setAttribute("width", "1px");
  canvas.setAttribute("height", "1px");
  return canvas.getContext("2d")!;
}

const measureTextCache = new BasketsCache<
  string,
  { [key: string]: { width: number } }
>({
  basketLifetime: 1500,
  maxBaskets: 4
});

export function measureText(font: string, content: string): { width: number } {
  // don't join font and content
  // so algo will be less memory hungry
  let cacheObj = measureTextCache.get(content);
  if (!cacheObj) {
    cacheObj = {};
    measureTextCache.set(content, cacheObj);
  } else if (cacheObj[font]) {
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
  const result = _measureContext.measureText(content);
  cacheObj[font] = result;
  return result;
}

export function countLines(
  text: string,
  font: string,
  maxWidth: number,
  maxLines: number
): number {
  let words = text.split(SPACES_REGEXP);
  let linesCount = 0;
  let currentLine = words[0];
  let i;
  for (i = 1; i < words.length; i++) {
    let nextLine = currentLine + (currentLine.length ? " " : "") + words[i];
    if (maxWidth < measureText(font, nextLine).width) {
      linesCount++;
      if (linesCount >= maxLines) {
        return linesCount;
      }
      currentLine = words[i];
    } else {
      currentLine = nextLine;
    }
  }
  if (currentLine !== "") {
    linesCount++;
  }
  return linesCount;
}

export function renderMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  left: number,
  top: number,
  width: number,
  height: number,
  lineHeight: number,
  textAlign?: TEXT_ALIGN,
  verticalAlign?: VERTICAL_ALIGN,
  maxLines = Infinity,
  ellipsisChar?: string
) {
  let words = text.split(SPACES_REGEXP);
  let lines = [];
  let currentLine = words[0];
  let i;
  for (i = 1; i < words.length; i++) {
    let nextLine = currentLine + (currentLine.length ? " " : "") + words[i];
    if (width < measureText(ctx.font, nextLine).width) {
      lines.push(currentLine);
      if (lines.length >= maxLines) {
        if (ellipsisChar) {
          lines.push(
            endWithEllipsis(ctx, lines.pop()!, words, i, width, ellipsisChar)
          );
        }
        currentLine = "";
        break;
      }
      currentLine = words[i];
    } else {
      currentLine = nextLine;
    }
  }
  if (currentLine !== "") {
    lines.push(currentLine);
  }

  let startX;
  switch (verticalAlign) {
    case VERTICAL_ALIGN_TOP:
      startX = top;
      break;
    case VERTICAL_ALIGN_BOTTOM:
      startX = top + height - lines.length * lineHeight;
      ctx.textBaseline = "bottom";
      break;
    default:
      startX = top + (height - lines.length * lineHeight) / 2;
      ctx.textBaseline = "middle";
      break;
    }

  for (i = 0; i < lines.length; i++) {
    renderText(
      ctx,
      lines[i],
      left,
      startX,
      width,
      lineHeight,
      textAlign,
      verticalAlign
    );
    startX += lineHeight;
  }
}

function innerBorderPath(
  ctx: CanvasRenderingContext2D,
  borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number,
  layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number
) {
  let layoutRight = layoutLeft + layoutWidth;
  let layoutBottom = layoutTop + layoutHeight;
  let radius = Math.min(borderRadius, layoutWidth / 2, layoutHeight / 2);
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
  let radiusTopLeft = Math.max(0, radius - Math.max(borderTop, borderLeft));
  let radiusTopRight = Math.max(0, radius - Math.max(borderTop, borderRight));
  let radiusBottomRight = Math.max(
    0,
    radius - Math.max(borderBottom, borderRight)
  );
  let radiusBottomLeft = Math.max(
    0,
    radius - Math.max(borderBottom, borderLeft)
  );
  ctx.lineWidth = 1;
  ctx.moveTo(
    layoutLeft + radiusTopLeft + borderLeft,
    layoutTop + borderTop
  );
  ctx.lineTo(
    layoutRight - radiusTopRight - borderRight,
    layoutTop + borderTop
  );
  radiusTopRight &&
    ctx.arcTo(
      layoutRight - borderRight,
      layoutTop + borderTop,
      layoutRight - borderRight,
      layoutTop + radius,
      radiusTopRight
    );
  ctx.lineTo(
    layoutRight - borderRight,
    layoutBottom - radiusBottomRight - borderBottom
  );
  radiusBottomRight &&
    ctx.arcTo(
      layoutRight - borderRight,
      layoutBottom - borderBottom,
      layoutRight - radius,
      layoutBottom - borderBottom,
      radiusBottomRight
    );
  ctx.lineTo(
    layoutLeft + radiusBottomLeft + borderLeft,
    layoutBottom - borderBottom
  );
  radiusBottomLeft &&
    ctx.arcTo(
      layoutLeft + borderLeft,
      layoutBottom - borderBottom,
      layoutLeft + borderLeft,
      layoutBottom - radius,
      radiusBottomLeft
    );
  ctx.lineTo(
    layoutLeft + borderLeft,
    layoutTop + radiusTopLeft + borderTop
  );
  radiusTopLeft &&
    ctx.arcTo(
      layoutLeft + borderLeft,
      layoutTop + borderTop,
      layoutLeft + radius,
      layoutTop + borderTop,
      radiusTopLeft
    );
}
export function outerBorderPath(
  ctx: CanvasRenderingContext2D,
  borderRadius: number,
  layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number,
  preferMove: boolean
) {
  let layoutRight = layoutLeft + layoutWidth,
      layoutBottom = layoutTop + layoutHeight;
  let radius = Math.min(borderRadius, layoutWidth / 2, layoutHeight / 2);
  // outerPath in backwards order
  if (radius <= 0) {
    if (preferMove) {
      ctx.moveTo(layoutLeft, layoutTop);
    } else {
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
  } else {
    ctx.lineTo(layoutLeft + radius, layoutTop);
  }
  ctx.arcTo(layoutLeft, layoutTop, layoutLeft, layoutTop + radius, radius);
  ctx.lineTo(layoutLeft, layoutBottom - radius);
  ctx.arcTo(
    layoutLeft,
    layoutBottom,
    layoutLeft + radius,
    layoutBottom,
    radius
  );
  ctx.lineTo(layoutRight - radius, layoutBottom);
  ctx.arcTo(
    layoutRight,
    layoutBottom,
    layoutRight,
    layoutBottom - radius,
    radius
  );
  ctx.lineTo(layoutRight, layoutTop + radius);
  ctx.arcTo(
    layoutRight,
    layoutTop,
    layoutRight - radius,
    layoutTop,
    radius
  );
  ctx.lineTo(layoutLeft + radius, layoutTop);
}
export function createBorderPath(
  ctx: CanvasRenderingContext2D,
  borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number,
  layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number
) {
  var radius = Math.min(borderRadius, layoutWidth / 2, layoutHeight / 2);
  if (radius < 0) {
    radius = 0;
  }
  ctx.beginPath();
  // innerPath
  innerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
  outerBorderPath(ctx, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight, false);
}
export function closedInnerBorderPath(
  ctx: CanvasRenderingContext2D,
  borderLeft: number, borderTop: number, borderRight: number, borderBottom: number, borderRadius: number,
  layoutLeft: number, layoutTop: number, layoutWidth: number, layoutHeight: number
) {
  var radius = Math.floor(
    Math.min(borderRadius, layoutWidth / 2, layoutHeight / 2)
  );
  if (radius === 0) {
    ctx.beginPath();
    ctx.rect(
      layoutLeft + borderLeft,
      layoutTop + borderTop,
      layoutWidth - borderLeft - borderRight,
      layoutHeight - borderTop - borderBottom
    );
  } else {
    ctx.beginPath();
    innerBorderPath(ctx, borderLeft, borderTop, borderRight, borderBottom, borderRadius, layoutLeft, layoutTop, layoutWidth, layoutHeight);
  }
}
