import { Command } from '../blueprints/Command';
import { IRunnableCommand } from '../interfaces/IRunnableCommand';

export class MissingPermissionCommand extends Command implements IRunnableCommand {
	public async run(): Promise<void> {
		await this.message.channel.send('Missing permissions');
	}
}
