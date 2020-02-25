import YogaLayout, {
    YogaNode,
    YogaFlexDirection,
    YogaJustifyContent,
    YogaAlign,
    YogaPositionType,
    YogaFlexWrap,
    YogaOverflow,
    YogaDisplay,
} from "yoga-layout";

const {
    Node,
    EDGE_TOP,
    EDGE_RIGHT,
    EDGE_BOTTOM,
    EDGE_ALL,
    EDGE_LEFT,
    EDGE_START,
    EDGE_END,
    EDGE_VERTICAL,
    EDGE_HORIZONTAL
} = YogaLayout;

import {IStyleProps, TEXT_ALIGN, VERTICAL_ALIGN, ILayoutNode} from "./node";
import { measureText, countLines } from "./renderUtils";
import { CanvasElementRegistry } from "./CanvasElementRegistry";


const YGMeasureModeUndefined = 0,
    YGMeasureModeExactly = 1,
    YGMeasureModeAtMost = 2;

class Style implements IStyleProps {
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
    
    constructor(el: CanvasElement) {
        this.el = el;
    }

    isMeasureFunctionSet: boolean = false;
    isTextNode: boolean = false;

    removeProperty(name: string) {
        if (this.el._doc) {
            this.el._doc.markDirty();
        }

        this.setProperty(name, NaN);
    }

    setProperty(name: string, value: any) {
        if (this.el._doc) {
            this.el._doc.markDirty();
        }

        (this as any)[name] = value;
        var node = this.el._yogaNode;
        switch(name) {
            case "font":
            case "fontSize":
            case "maxLines":
                if (this.isMeasureFunctionSet) {
                    // invalidate layout
                    if (!node.isDirty()) {
                        node.markDirty();
                    }
                }
                break;
            case "alignContent":
                node.setAlignContent(value);
                break;
            case "alignItems":
                node.setAlignItems(value);
                break;
            case "alignSelf":
                node.setAlignSelf(value);
                break;
            case "aspectRatio":
                node.setAspectRatio(value !== undefined ? value : NaN);
                break;
            case "display":
                node.setDisplay(value);
                break;
            case "flex":
                node.setFlex(value);
                break;
            case "flexBasis":
                node.setFlexBasis(value);
                break;
            case "flexDirection":
                node.setFlexDirection(value);
                break;
            case "flexGrow":
                node.setFlexGrow(value);
                break;
            case "flexShrink":
                node.setFlexShrink(value);
                break;
            case "flexWrap":
                node.setFlexWrap(value);
                break;
            case "height":
                node.setHeight(value);
                this.validateMeasureFun();
                break;
            case "justifyContent":
                node.setJustifyContent(value);
                break;
            case "maxHeight":
                node.setMaxHeight(value !== undefined ? value : NaN);
                break;
            case "maxWidth":
                node.setMaxWidth(value !== undefined ? value : NaN);
                break;
            case "minHeight":
                node.setMinHeight(value !== undefined ? value : NaN);
                break;
            case "minWidth":
                node.setMinWidth(value !== undefined ? value : NaN);
                break;
            case "overflow":
                node.setOverflow(value);
                break;
            case "position":
                node.setPositionType(value);
                break;
            case "width":
                node.setWidth(value);
                this.validateMeasureFun();
                break;
            case "top":
                node.setPosition(EDGE_TOP, value !== undefined ? value : NaN);
                break;
            case "right":
                node.setPosition(EDGE_RIGHT, value !== undefined ? value : NaN);
                break;
            case "bottom":
                node.setPosition(EDGE_BOTTOM, value !== undefined ? value : NaN);
                break;
            case "left":
                node.setPosition(EDGE_LEFT, value !== undefined ? value : NaN);
                break;

            case "margin":
                node.setMargin(EDGE_ALL, value !== undefined ? value : NaN);
                break;
            case "marginTop":
                node.setMargin(EDGE_TOP, value !== undefined ? value : NaN);
                break;
            case "marginLeft":
                node.setMargin(EDGE_LEFT, value !== undefined ? value : NaN);
                break;
            case "marginBottom":
                node.setMargin(EDGE_BOTTOM, value !== undefined ? value : NaN);
                break;
            case "marginRight":
                node.setMargin(EDGE_RIGHT, value !== undefined ? value : NaN);
                break;
            case "marginVertical":
                node.setMargin(EDGE_VERTICAL, value !== undefined ? value : NaN);
                break;
            case "marginHorizontal":
                node.setMargin(EDGE_HORIZONTAL, value !== undefined ? value : NaN);
                break;

            case "padding":
                node.setPadding(EDGE_ALL, value !== undefined ? value : NaN);
                break;
            case "paddingTop":
                node.setPadding(EDGE_TOP, value !== undefined ? value : NaN);
                break;
            case "paddingLeft":
                node.setPadding(EDGE_LEFT, value !== undefined ? value : NaN);
                break;
            case "paddingBottom":
                node.setPadding(EDGE_BOTTOM, value !== undefined ? value : NaN);
                break;
            case "paddingRight":
                node.setPadding(EDGE_RIGHT, value !== undefined ? value : NaN);
                break;
            case "paddingVertical":
                node.setPadding(EDGE_VERTICAL, value !== undefined ? value : NaN);
                break;
            case "paddingHorizontal":
                node.setPadding(EDGE_HORIZONTAL, value !== undefined ? value : NaN);
                break;

            case "border":
                node.setBorder(EDGE_ALL, value !== undefined ? value : NaN);
                break;
            case "borderTop":
                node.setBorder(EDGE_TOP, value !== undefined ? value : NaN);
                break;
            case "borderLeft":
                node.setBorder(EDGE_LEFT, value !== undefined ? value : NaN);
                break;
            case "borderBottom":
                node.setBorder(EDGE_BOTTOM, value !== undefined ? value : NaN);
                break;
            case "borderRight":
                node.setBorder(EDGE_RIGHT, value !== undefined ? value : NaN);
                break;


            case "borderStart":
                node.setBorder(EDGE_START, value !== undefined ? value : NaN);
                break;
            case "borderEnd":
                node.setBorder(EDGE_END, value !== undefined ? value : NaN);
                break;
            case "paddingStart":
                node.setPadding(EDGE_START, value !== undefined ? value : NaN);
                break;
            case "paddingEnd":
                node.setPadding(EDGE_END, value !== undefined ? value : NaN);
                break;
            
            case "marginStart":
                node.setMargin(EDGE_START, value !== undefined ? value : NaN);
                break;
            case "marginEnd":
                node.setMargin(EDGE_END, value !== undefined ? value : NaN);
                break;
        }
    }

    setIsTextNode(isTextNode: boolean) {
        this.isTextNode = isTextNode;
        this.validateMeasureFun();
    }

    validateMeasureFun() {
        if (this.isTextNode && (this.width === undefined || this.height === undefined)) {
            if (!this.isMeasureFunctionSet) {
                this.isMeasureFunctionSet = true;
                this.el._yogaNode.setMeasureFunc(this.createMeasureFunction(this.el) as () => any);
            }
        } else if (this.isMeasureFunctionSet) {
            this.isMeasureFunctionSet = false;
            this.el._yogaNode.unsetMeasureFun();
        }
    }

  createMeasureFunction(node: CanvasElement) {
    return (
      width: number,
      widthMode: number,
      height: number,
      heightMode: number
    ) => {
      var style = node.style;
      var fontSize = style.fontSize || 0
      var font = fontSize + "px " + style.font;
      var targetWidth!: number,
        targetHeight: number = 0;
      var lineHeight = fontSize * (style.lineHeight !== undefined ? style.lineHeight : 1.2);

      switch (widthMode) {
        case YGMeasureModeExactly:
          // default behavior
          targetWidth = width;
          break;
        case YGMeasureModeAtMost:
          var tw = measureText(font, node.content!).width;
          targetWidth = Math.min(tw, width);
          break;
        default:
        case YGMeasureModeUndefined:
          targetWidth = measureText(font, node.content!).width;
          break;
      }

      switch (heightMode) {
        case YGMeasureModeExactly:
          targetHeight = height;
          break;
        case YGMeasureModeAtMost:
          var th = node.style.maxLines === undefined
              ? lineHeight
              : lineHeight *
                countLines(node.content!, font, targetWidth, node.style.maxLines || 1);
          targetHeight = Math.min(th, height);
          break;
        case YGMeasureModeUndefined:
          targetHeight = node.style.maxLines === undefined
              ? lineHeight
              : lineHeight *
                countLines(node.content!, font, targetWidth, node.style.maxLines || 1);
          break;
      }

      return { width: targetWidth, height: targetHeight };
    };
  }
}
export class CanvasElement implements ILayoutNode {
    readonly registry: CanvasElementRegistry;
    readonly nodeName: string;
    constructor(nodeName: string, registry: CanvasElementRegistry) {
        this.nodeName = nodeName;
        this.registry = registry;
        this._yogaNode = Node.create();
        this.style = new Style(this);
    }

    free() {
        if (this._yogaNode) {
            this._yogaNode.freeRecursive();
        }
    }

    public parentNode?: CanvasElement;
    public _yogaNode: YogaNode;

    public children: CanvasElement[] | undefined;
    public style: Style;
    public content?: string;

    public _doc: any;
    public $EV?: {[name: string]: () => any}

    set innerHTML(value: string) {
        throw new Error("Unsupported operation.");
    }
    set textContent(value: string) {
        if (value.length > 0) {
            throw new Error("Unsupported operation.");
        }
        if (this.children) {
            while(this.children.length) {
                this.removeChild(this.children[0]);
            }
        }
    }

    _setDoc(doc: any) {
        if (this._doc === doc) {
            return;
        }
        if (this.$EV) {
            if (this._doc) {
                for (const key in this.$EV) {
                    this._doc.removeEvent(key);
                }
            }
            if (doc) {
                for (const key in this.$EV) {
                    doc.addEvent(key);
                }
            }
        }
        this._doc = doc;
        if (this.children) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i]._setDoc(doc);
            }
        }
    }

    setAttribute(name: string, value: any) {
        if (this._doc) {
            this._doc.markDirty();
        }

        (this as any)[name] = value;
        switch (name) {
            case "content":
                // invalidate layout
                if (this.style.isMeasureFunctionSet && !this._yogaNode.isDirty()) {
                    this._yogaNode.markDirty();
                }

                this.style.setIsTextNode(true);
                break;
        }
    }

    removeAttribute(name: string) {
        if (this._doc) {
            this._doc.markDirty();
        }

        (this as any)[name] = undefined;
        switch (name) {
            case "content":
                // invalidate layout
                if (!this._yogaNode.isDirty()) {
                    this._yogaNode.markDirty();
                }

                this.style.setIsTextNode(false);
                break;
        }

    }

    appendChild(child: CanvasElement) {
        if (this._doc) {
            this._doc.markDirty();
        }

        this._verifyElementDetached(child);

        if (!this.children) {
            this.children = [];
        }

        this._yogaNode.insertChild(child._yogaNode, this.children.length);
        this.children.push(child);
        child.parentNode = this;
        child._setDoc(this._doc);
    }
    

    insertBefore(newNode: CanvasElement, nextNode: CanvasElement) {
        if (this._doc) {
            this._doc.markDirty();
        }

        this._verifyElementDetached(newNode);

        if (!this.children) {
            this.children = [];
        }

        let index = this.children.indexOf(nextNode);
        if (index !== -1) {
            this.children.splice(index, 0, newNode);
            this._yogaNode.insertChild(newNode._yogaNode, index);
        } else {
            this._yogaNode.insertChild(newNode._yogaNode, this.children.length);
            this.children.push(newNode);
        }
        newNode.parentNode = this;
        newNode._setDoc(this._doc);
    }

    replaceChild(newDom: CanvasElement, lastDom: CanvasElement) {
        if (this._doc) {
            this._doc.markDirty();
        }

        this._verifyElementDetached(newDom);

        // optimized, guaranteed by inferno
        // if (!this.children) {
        //     this.children = [];
        // }

        let index = this.children!.indexOf(lastDom);
        if (index !== -1) {
            this.removeChild(lastDom);
            this._yogaNode.insertChild(newDom._yogaNode, index);
            this.children!.splice(index, 0, newDom);
        }
    }

    removeChild(childNode: CanvasElement) {
        if (this._doc) {
            this._doc.markDirty();
        }

        // optimized, guaranteed by inferno
        // if (!this.children) {
        //     this.children = [];
        // }

        let index = this.children!.indexOf(childNode);
        if (index !== -1) {
            this._yogaNode.removeChild(childNode._yogaNode);
            this.children!.splice(index, 1);
            childNode.parentNode = undefined;
            this.registry.addNodeToCleanupQueue(childNode);
            // required to count events
            childNode._setDoc(undefined);
        }
    }

    /*
     * EVENTS implementation
     */
    addEventListener(name: string, fn: () => any) {
        // optimized
        // there is no way how to set 2 or more SAME events with inferno
        if (!this.$EV) {
            this.$EV = {};
        }
        this.$EV[name] = fn;
        if (this._doc) {
            this._doc.addEvent(name);
        }
    }
    removeEventListener(name: string, fn: () => any) {
        // optimized
        // there is no way how to set 2 or more SAME events with inferno
        
        // optimized, guaranteed by inferno
        // if (!this.$EV) {
        //     return;
        // }
        delete this.$EV![name];
        this._doc.removeEvent(name);
    }

    /**
     * Verify that child is detached
     */
    private _verifyElementDetached(child: CanvasElement) {
        if (child.parentNode !== undefined) {
            child.parentNode.removeChild(child);
        }
        this.registry.removeNodeFromCleanupQueue(child);
    }
}
