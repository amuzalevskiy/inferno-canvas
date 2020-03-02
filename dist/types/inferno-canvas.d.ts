import { Component, createFragment, createVNode, createComponentVNode, createTextVNode, normalizeProps } from 'inferno';
import { IStyleProps, IStyleDefinition } from "./node";
import { parseStyle } from './parseStyle';
import { CanvasDocument } from './CanvasDocument';
import { AnimationFrameHandler } from './AnimationFrameHandler';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            v: {
                style?: IStyleProps;
                key?: number | string;
                children?: any;
                onClick?: () => any;
                onMouseDown?: () => any;
                onMouseMove?: () => any;
                onMouseUp?: () => any;
                onMouseEnter?: () => any;
                onMouseLeave?: () => any;
            };
            t: {
                style?: IStyleProps;
                key?: number | string;
                content?: string;
                onClick?: () => any;
                onMouseDown?: () => any;
                onMouseMove?: () => any;
                onMouseUp?: () => any;
                onMouseEnter?: () => any;
                onMouseLeave?: () => any;
            };
        }
    }
}
export declare let animationFrameHandler: AnimationFrameHandler;
declare function _requestAnimationFrame(cb: (time: number) => void): number;
declare function _cancelAnimationFrame(id: number): void;
declare function mount(component: JSX.Element, canvas: HTMLCanvasElement, left: number, top: number, width: number, height: number): CanvasDocument | undefined;
declare function unmount(canvas: HTMLCanvasElement): void;
export { mount, unmount, _requestAnimationFrame as requestAnimationFrame, _cancelAnimationFrame as cancelAnimationFrame, Component, parseStyle, IStyleProps, IStyleDefinition, createFragment, createVNode, createComponentVNode, createTextVNode, normalizeProps };
