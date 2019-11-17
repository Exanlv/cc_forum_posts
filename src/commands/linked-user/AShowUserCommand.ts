import { RichEmbed, RichPresenceAssets } from 'discord.js';
import { Command } from '../../blueprints/Command';
import { friendlyPropertyName } from '../../helper';

export abstract class AShowUserCommand extends Command {
	protected async getUserEmbed(userId: string): Promise<RichEmbed> {
		let forumUser = await this.bot.cubecraftForum.getUserInfo(userId);

		const embed = new RichEmbed;
		embed.setAuthor(`Forum user ${forumUser.username}`, forumUser.avatar, forumUser.url);
		embed.setThumbnail(forumUser.avatar);
		embed.setTitle('Account Info');

		embed.addField('**Status**', forumUser.status || 'None');

		embed.addField('**Forum Roles**', forumUser.roles.join(', ') || 'None');

		for (let i in forumUser.additionalUserInfo) {
			embed.addField(`**${friendlyPropertyName(i)}**`, forumUser.additionalUserInfo[i]);
		}

		return embed;
	}
}
