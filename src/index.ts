// import { Bot } from "./Bot";
// import { HtmlJson } from "./HtmlJson";

// require('dotenv').config();

// let test = new HtmlJson('https://cubecraft.net');
// test.loadDom();

// let bot = new Bot(process.env.TOKEN, Number(process.env.REFRESHTIMER));
import * as puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(this.url);
    
    await page.waitFor(7500);

    console.log(await page.evaluate(() => {
        return document.documentElement.outerHTML;
    }));
})()
