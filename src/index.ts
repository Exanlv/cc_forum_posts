import { Bot } from "./Bot";

require('dotenv').config();

let bot = new Bot(process.env.TOKEN, Number(process.env.REFRESHTIMER));
