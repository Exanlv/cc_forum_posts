import { Command } from '../../blueprints/Command';
import { Bot } from '../../bot';
import { generateRandomString } from '../../helper';
import { IRunnableCommand } from '../../interfaces/IRunnableCommand';

export class LinkCommand extends Command implements IRunnableCommand {
	public async run(): Promise<void> {
		if (this.bot.verifiedUsers[this.message.author.id]) {
			const message = `Hey ${(await this.bot.cubecraftForum.getUserInfo(this.bot.verifiedUsers[this.message.author.id])).username}! You already have your account linked, use \`${Bot.prefix}unlink\` to unlink your account.`;
			await this.message.channel.send(message);
			return;
		}

		const verificationKey = generateRandomString(10);

		this.bot.verifyingUsers[this.message.author.id] = verificationKey;

		let message = 'Hi there! Please send a direct message to me on the forum verifying your account!\n\n';
		message += `**Start a conversation here:**\n${this.bot.cubecraftForum.baseUrl}/conversations/add?to=${process.env.USERNAME.replace(/ /g, '+')}\n\n`;
		message += `**Send this message to complete linking:**\n\`VERIFY-${this.message.author.id}-${verificationKey}\``;

		try {
			await this.message.author.send(message);
		} catch (e) {
			this.message.channel.send(`\`\`\`${e}\`\`\``);
		}
	}
}
