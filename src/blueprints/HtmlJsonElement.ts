import { AttrJson } from "./AttrJson";

export class HtmlJsonElement {
    public node: string;
    public tag?: string;
    public child?: Array<HtmlJsonElement>;
    public attr?: AttrJson;

    [property: string]: any;
}