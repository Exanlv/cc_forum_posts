import { IRunnableCommand } from '../../interfaces/IRunnableCommand';
import { AShowUserCommand } from './AShowUserCommand';

export class MyAccountCommand extends AShowUserCommand implements IRunnableCommand {
	public async run(): Promise<void> {
		this.message.channel.send('haha yes');
	}
}
