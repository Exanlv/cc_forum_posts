import { IRunnableCommand } from '../../interfaces/IRunnableCommand';
import { AShowUserCommand } from './AShowUserCommand';
import { RichEmbed } from 'discord.js';

export class SearchUserCommand extends AShowUserCommand implements IRunnableCommand {
	public async run(): Promise<void> {
		const searchQ = this.command.slice(1).join(' ');

		if (searchQ === '') {
			this.sendMessage('Please provide something to search for');
		}

		let possibleUsers = await this.bot.cubecraftForum.searchMembers(searchQ);

		let pickedUser;

		/**
		 * Let the user pick whoevers profile to view, if there is only one option, no choice needs to be made
		 */
		if (possibleUsers.length === 1) {
			pickedUser = possibleUsers[0];
		} else {
			if (possibleUsers.length > 10) {
				possibleUsers = possibleUsers.slice(0, 10);
			}
	
			const message = new RichEmbed();
			message.setColor(process.env.EMBED_COLOR);
			message.setTitle(`Search results for \`${searchQ}\``);
	
			if (!possibleUsers.length) {
				message.setDescription('No results');
				this.sendMessage(message);
				return;
			}
			
			const reacts = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].slice(0, possibleUsers.length);

			let description = '';
			for (let i in possibleUsers) {
				description += `**${(Number(i) + 1)}:** ${possibleUsers[i]}\n`;
			}
	
			message.setDescription(description);
	
			pickedUser = await this.reactInput(message, reacts, possibleUsers);
		}

		if (!pickedUser) {
			this.sendMessage('Unable to show user profile, no user was selected.');
			return;
		}

		this.sendMessage(await this.getUserEmbed(await this.bot.cubecraftForum.getUserIdByUsername(pickedUser)));
	}
}
