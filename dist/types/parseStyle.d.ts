import { IStyleProps, IStyleDefinition, TEXT_ALIGN, VERTICAL_ALIGN } from "./node";
export declare type TEXT_ALIGN_STRING = "left" | "center" | "right";
export declare function parseTextAlign(value: TEXT_ALIGN_STRING): TEXT_ALIGN;
export declare type VERTICAL_ALIGN_STRING = "top" | "bottom" | "middle";
export declare function parseVerticalAlign(value: VERTICAL_ALIGN_STRING): VERTICAL_ALIGN;
export declare function parseStyle(style: IStyleDefinition | IStyleProps | Array<IStyleDefinition | IStyleProps>): IStyleProps;
