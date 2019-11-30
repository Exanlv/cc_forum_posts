import { Collection, Emoji, Message, MessageReaction, RichEmbed, User } from 'discord.js';
import { Bot } from '../bot';
import { PermissionLevel } from '../enums/PermissionLevel';

export abstract class Command {

	/**
     * The message send by the user triggering the command
     */
	public message: Message;

	/**
     * Client of bot
     */
	public bot: Bot;

	/**
     * Permission level of user
     */
	public userPermission: PermissionLevel;

	/**
	 * The command as used by the user, prefix removed
	 */
	public command: string[];

	public constructor(message: Message, bot: Bot, userPermission: PermissionLevel, command: string[]) {
		this.message = message;
		this.bot = bot;
		this.userPermission = userPermission;
		this.command = command;
	}

	/**
	 * Ask user for input with reacts, if no reacts are given, only the message will be send
	 * @param message The message that should be send
	 * @param reacts The reacts that are allowed / have a value
	 * @param values The return value for each reaction
	 */
	protected async reactInput(message: string|RichEmbed, reacts: Array<string|Emoji>, values: any[], deleteMessage: boolean = true): Promise<any> {
		const discordMessage = await this.sendMessage(message);

		if (!(reacts.length && reacts.length === values.length)) {
			return;
		}

		const allowed = reacts.map((e: string|Emoji) => typeof e === 'string' ? e : e.id);

		/**
		 * Janky way to make sure the reacts are done in the correct order while
		 * still being async allowing the code to move on
		 */
		let reactCount = 0;

		const reactNext = async (): Promise<void> => {
			reactCount++;

			while (reactCount < reacts.length) {
				try {
					await discordMessage.react(reacts[reactCount]);
				} catch (e) { return; }

				reactCount++;
			}
		};

		discordMessage.react(reacts[reactCount]).then(reactNext);

		const reactUsed = (await discordMessage.awaitReactions(
			(e: MessageReaction, u: User) => allowed.includes(e.emoji.id || e.emoji.name) && u.id === this.message.author.id,
			{max: 1, time: 30000},
		)).first();

		if (deleteMessage) {
			discordMessage.delete();
		}

		if (!reactUsed) {
			return;
		}

		for (const i in reacts) {
			if ((typeof reacts[i] === 'string' && reacts[i] === reactUsed.emoji.name) || ((reacts[i] as Emoji).id === reactUsed.emoji.id)) {
				return values[i];
			}
		}
	}

	protected async sendMessage(message: string|RichEmbed): Promise<Message> {
		return (await this.message.channel.send(message)) as Message;
	}
}
