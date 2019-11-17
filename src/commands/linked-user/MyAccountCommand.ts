import { IRunnableCommand } from '../../interfaces/IRunnableCommand';
import { AShowUserCommand } from './AShowUserCommand';

export class MyAccountCommand extends AShowUserCommand implements IRunnableCommand {
	public async run(): Promise<void> {
		this.message.channel.send(await this.getUserEmbed(this.bot.verifiedUsers[this.message.author.id]));
	}
}
