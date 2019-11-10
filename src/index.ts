import { Bot } from "./Bot";
import { HtmlJson } from "./HtmlJson";

require('dotenv').config();

let test = new HtmlJson('https://cubecraft.net');
test.loadDom();

// let bot = new Bot(process.env.TOKEN, Number(process.env.REFRESHTIMER));
