import * as fetch from 'node-fetch';
import { html2json } from 'html2json';
import { HtmlJsonElement } from './blueprints/HtmlJsonElement';
import * as puppeteer from 'puppeteer';

export class HtmlJson {
    private url: string;
    public dom: Array<HtmlJsonElement>;
    
    constructor(url: string) {
        this.url = url;
    }

    public async loadDom(): Promise<void> {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(this.url);
        
        await page.waitFor(7500);

        console.log(await page.evaluate(() => {
            return document.documentElement.outerHTML;
        }));
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