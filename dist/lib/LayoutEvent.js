"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapEventType = {
    click: 1,
    dblclick: 1,
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
function bubbleEvent(e, node) {
    var event = new LayoutEvent(e, e.type, node);
    var current = node;
    while (current) {
        if (current.$EV) {
            event.currentTarget = current;
            current.$EV[event.type].call(current, event);
            if (event.cancelBubble) {
                return;
            }
        }
        current = current.parentNode;
    }
}
exports.bubbleEvent = bubbleEvent;
var LayoutEvent = /** @class */ (function () {
    function LayoutEvent(originalEvent, type, target, bubbles) {
        if (bubbles === void 0) { bubbles = true; }
        this.cancelBubble = false;
        this.originalEvent = originalEvent;
        this.target = target;
        this.currentTarget = target;
        this.type = type || originalEvent.type;
        this.cancelBubble = !bubbles;
    }
    LayoutEvent.prototype.stopPropagation = function () {
        this.cancelBubble = true;
    };
    Object.defineProperty(LayoutEvent.prototype, "defaultPrevented", {
        get: function () {
            return this.originalEvent.defaultPrevented;
        },
        enumerable: true,
        configurable: true
    });
    LayoutEvent.prototype.preventDefault = function () {
        this.originalEvent.preventDefault();
    };
    return LayoutEvent;
}());
exports.LayoutEvent = LayoutEvent;
//# sourceMappingURL=LayoutEvent.js.map