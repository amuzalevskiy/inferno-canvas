"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapEventType = {
    click: 1,
    mousedown: 1,
    mousemove: 1,
    mouseup: 1
    /*
        mouseenter: 'onMouseEnter',
        mouseleave: 'onMouseLeave',
        mouseout: 'onMouseOut',
        mouseover: 'onMouseOver',
    */
};
function bubbleEvent(e, type, node) {
    var event = new CanvasViewEvent(e, type, node);
    var current = node;
    while (current) {
        if (current.$EV && current.$EV[type]) {
            event.currentTarget = current;
            current.$EV[type].call(current, event);
            if (event.cancelBubble) {
                return;
            }
        }
        current = current.parentNode;
    }
}
exports.bubbleEvent = bubbleEvent;
var CanvasViewEvent = /** @class */ (function () {
    function CanvasViewEvent(originalEvent, type, target, bubbles) {
        if (bubbles === void 0) { bubbles = true; }
        this.cancelBubble = false;
        this.originalEvent = originalEvent;
        this.target = target;
        this.currentTarget = target;
        this.type = type || originalEvent.type;
        this.cancelBubble = !bubbles;
    }
    CanvasViewEvent.prototype.stopPropagation = function () {
        this.cancelBubble = true;
    };
    Object.defineProperty(CanvasViewEvent.prototype, "defaultPrevented", {
        get: function () {
            return this.originalEvent.defaultPrevented;
        },
        enumerable: true,
        configurable: true
    });
    CanvasViewEvent.prototype.preventDefault = function () {
        this.originalEvent.preventDefault();
    };
    return CanvasViewEvent;
}());
exports.CanvasViewEvent = CanvasViewEvent;
//# sourceMappingURL=CanvasViewEvent.js.map