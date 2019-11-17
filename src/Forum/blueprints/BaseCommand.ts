import { DirectMessage } from "./DirectMessage";
import { Bot } from "../../bot";

export abstract class BaseCommand {
    protected dm: DirectMessage;
    protected bot: Bot;
    protected command: Array<string>;

    constructor(dm: DirectMessage, bot: Bot) {
        this.dm = dm;
        this.bot = bot;

        this.command = this.dm.message.split('-');
    }
}