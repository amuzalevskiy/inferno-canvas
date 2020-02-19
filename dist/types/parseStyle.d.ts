import { IStyleProps, IStyleDefinition, TEXT_ALIGN, VERTICAL_ALIGN } from "./node";
export declare function parseTextAlign(value: string): TEXT_ALIGN;
export declare function parseVerticalAlign(value: string): VERTICAL_ALIGN;
export declare function parseStyle(style: IStyleDefinition | IStyleProps | Array<IStyleDefinition | IStyleProps>): IStyleProps;
