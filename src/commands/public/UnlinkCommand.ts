import { Command } from '../../blueprints/Command';
import { IRunnableCommand } from '../../interfaces/IRunnableCommand';

export class UnlinkCommand extends Command implements IRunnableCommand {
	public async run(): Promise<void> {
		if (!this.bot.verifiedUsers[this.message.author.id]) {
			await this.message.channel.send('You do not have a linked forum account set.');
			return;
		}

		this.bot.removeVerifiedUser(this.message.author.id);

		this.bot.client.guilds.tap(async (guild) => {
			const guildMember = await guild.fetchMember(this.message.author.id);

			if (!guildMember) {
				return;
			}

			const serverConfig = this.bot.serverConfigs[guild.id];

			if (!serverConfig || !serverConfig.rankLinkingEnabled) {
				return;
			}

			for (let i in serverConfig.rankRoles) {
				let role = guildMember.roles.find(r => r.id === serverConfig.rankRoles[i]);

				if (role) {
					guildMember.removeRole(role);
				}
			}
		});

		await this.message.channel.send('Your forum account has been unlinked!');
	}
}
