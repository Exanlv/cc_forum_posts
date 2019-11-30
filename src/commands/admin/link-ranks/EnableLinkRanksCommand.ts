import { Role } from 'discord.js';
import { ServerCommand } from '../../../blueprints/ServerCommand';
import { RankRoles } from '../../../config/RankRoles';
import { jaydenSmithify } from '../../../helper';
import { IRunnableCommand } from '../../../interfaces/IRunnableCommand';

export class EnableLinkRanksCommand extends ServerCommand implements IRunnableCommand {
	public async run(): Promise<void> {
		this.serverConfig.rankLinkingEnabled = true;

		if (this.message.guild.roles.array().length + Object.keys(RankRoles).length > 200) {
			await this.sendMessage('You dont have enough role slots to set up rank linking, consider freeing up some slots.');
			return;
		}

		for (const i in RankRoles) {
			try {
				const role = await this.message.guild.createRole({name: jaydenSmithify(i), color: `#${RankRoles[i]}`});
				this.serverConfig.rankRoles[i] = role.id;
			} catch (e) {
				for (const i in this.serverConfig.rankRoles) {
					const role = this.message.guild.roles.find((r: Role) => r.id === this.serverConfig.rankRoles[i]);

					if (role) {
						role.delete().catch((e: any) => {
							console.log(e);
							return;
						});
					}
				}

				await this.sendMessage('Something went wrong, please try again later.');
				return;
			}
		}

		this.serverConfig.saveData();
		await this.message.react('👍');
	}
}
