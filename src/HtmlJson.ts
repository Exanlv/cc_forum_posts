import * as fetch from 'node-fetch';
import { html2json } from 'html2json';
import { HtmlJsonElement } from './blueprints/HtmlJsonElement';
import { writeFileSync } from 'fs';

export class HtmlJson {
    private url: string;
    public dom: Array<HtmlJsonElement>;
    
    constructor(url: string) {
        this.url = url;
    }

    public async loadDom(): Promise<void> {
        writeFileSync('./test.html', await (await fetch(this.url)).text());
        this.dom = [html2json(await (await fetch(this.url)).text())];
    }

    public findElement(
        match: (element: HtmlJsonElement) => boolean, 
        elements?: Array<HtmlJsonElement>
    ): HtmlJsonElement {
        elements = elements || this.dom;

        for (let i in elements) {
            if (match(elements[i]) === true) {
                return elements[i];
            }

            if (elements[i].child) {
                let childMatch = this.findElement(match, elements[i].child);

                if (childMatch !== null) {
                    return childMatch;
                }
            }
        }

        return null;
    }
}