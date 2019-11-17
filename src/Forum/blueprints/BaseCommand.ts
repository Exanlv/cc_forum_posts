import { Bot } from '../../bot';
import { DirectMessage } from './DirectMessage';

export abstract class BaseCommand {
	protected dm: DirectMessage;
	protected bot: Bot;
	protected command: string[];

	constructor(dm: DirectMessage, bot: Bot) {
		this.dm = dm;
		this.bot = bot;

		this.command = this.dm.message.split('-');
	}
}
