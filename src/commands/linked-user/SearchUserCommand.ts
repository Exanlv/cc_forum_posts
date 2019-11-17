import { IRunnableCommand } from '../../interfaces/IRunnableCommand';
import { AShowUserCommand } from './AShowUserCommand';

export class SearchUserCommand extends AShowUserCommand implements IRunnableCommand {
	public async run(): Promise<void> {
		const page = await this.bot.cubecraftForum.browser.newPage();

		await page.goto('https://www.cubecraft.net/members/');

		await page.type('input[name=username]', 'rifyy');
	}
}
