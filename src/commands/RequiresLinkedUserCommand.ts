import { Command } from "../blueprints/Command";
import { IRunnableCommand } from "../interfaces/IRunnableCommand";
import { Bot } from "../bot";

export class RequiresLinkedUserCommand extends Command implements IRunnableCommand {
    public async run(): Promise<void> {
        await this.message.channel.send(`This command requires you to have an account linked! Use \`${Bot.prefix}link\` to link your account.`);
    }
}