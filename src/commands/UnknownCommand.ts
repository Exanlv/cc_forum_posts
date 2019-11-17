import { Command } from '../blueprints/Command';
import { Bot } from '../bot';
import { IRunnableCommand } from '../interfaces/IRunnableCommand';

export class UnknownCommand extends Command implements IRunnableCommand {
	public async run(): Promise<void> {
		await this.message.channel.send(`Unknown command, use \`${Bot.prefix}help\` for a list of commands!`);
	}
}
