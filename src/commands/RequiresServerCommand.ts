import { Command } from '../blueprints/Command';
import { Bot } from '../bot';
import { IRunnableCommand } from '../interfaces/IRunnableCommand';

export class RequiresServerCommand extends Command implements IRunnableCommand {
	public async run(): Promise<void> {
		await this.message.channel.send('This command needs to be run in a server.');
	}
}
