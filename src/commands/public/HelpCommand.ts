import { Command } from '../../blueprints/Command';
import { IRunnableCommand } from '../../interfaces/IRunnableCommand';

export class HelpCommand extends Command implements IRunnableCommand {
	public async run(): Promise<void> {
		await this.message.channel.send('Hi there! This command isnt implemented yet.');
	}
}
