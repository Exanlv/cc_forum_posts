import { Bot } from "./bot";

require('dotenv').config();

const bot = new Bot(process.env.TOKEN);

bot.startUp();
