import { IRunnableCommand } from '../../interfaces/IRunnableCommand';
import { BaseCommand } from '../blueprints/BaseCommand';

export class VerifyCommand extends BaseCommand implements IRunnableCommand {
	public async run(): Promise<void> {
		/**
         * Make sure the command has proper arguments, {command}-{discordid}-{key}
         */
		if (this.command.length !== 3) {
			return;
		}

		const [commandKey, discordId, verificationKey] = this.command;

		if (!this.bot.verifyingUsers[discordId]) {
			return;
		}

		const discordMember = await this.bot.client.fetchUser(discordId);

		if (!discordMember) {
			return;
		}

		if (this.bot.verifyingUsers[discordId] !== verificationKey) {
			try {
				let message = 'Hey! Someone tried linking your account!\n';
				message += `This link attempt was made by the user \`${this.dm.author.username}\`.\n\n`;
				message += `If this was you, your linking attempt failed. Please send me another direct message on the forum with \`VERIFY-${discordId}-${this.bot.verifyingUsers[discordId]}\``;

				await discordMember.send(message);
			} catch (e) { return; }

			return;
		}

		this.bot.addVerifiedUser(discordId, this.dm.author.userId);

		try {
			discordMember.send(`Hey ${this.dm.author.username}! Your account has been linked succesfully. Use \`--unlink\` to remove this link if you want to!`);
		} catch (e) { return; }
	}
}
