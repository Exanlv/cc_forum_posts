import { RichEmbed, RichPresenceAssets } from 'discord.js';
import { Command } from '../../blueprints/Command';
import { friendlyPropertyName } from '../../helper';

export abstract class AShowUserCommand extends Command {
	protected async getUserEmbed(userId: string): Promise<RichEmbed|string> {
		const forumUser = await this.bot.cubecraftForum.getUserInfo(userId);

		if (forumUser.private) {
			return `Profile is set to private/limited. Unable to retrieve data.\n\n**Profile page:** ${forumUser.url}`;
		}

		const embed = new RichEmbed();

		embed.setAuthor(`Forum user ${forumUser.username}`, forumUser.avatar || 'https://imgur.com/Ax61hVc', forumUser.url);

		embed.setColor(process.env.EMBED_COLOR);

		embed.setThumbnail(forumUser.avatar);
		embed.setTitle('Account Info');

		embed.addField('**Status**', forumUser.status || 'None');

		embed.addField('**Forum Roles**', forumUser.roles.join(', ') || 'None');

		for (const i in forumUser.additionalUserInfo) {
			embed.addField(`**${friendlyPropertyName(i)}**`, forumUser.additionalUserInfo[i]);
		}

		return embed;
	}
}
