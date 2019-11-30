import { Bot } from './bot';

require('@exan/envreader').load();

const bot = new Bot(process.env.TOKEN);

bot.startUp();
