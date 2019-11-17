import { RichEmbed, RichPresenceAssets } from 'discord.js';
import { Command } from '../../blueprints/Command';

export abstract class AShowUserCommand extends Command {
	protected getUserEmbed(userId: string): RichEmbed {
		return new RichEmbed();
	}
}
