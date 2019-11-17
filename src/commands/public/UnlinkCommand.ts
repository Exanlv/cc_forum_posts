import { Command } from "../../blueprints/Command";
import { IRunnableCommand } from "../../interfaces/IRunnableCommand";

export class UnlinkCommand extends Command implements IRunnableCommand {
    public async run(): Promise<void> {
        if (!this.bot.verifiedUsers[this.message.author.id]) {
            await this.message.channel.send('You do not have a linked forum account set.');
            return;
        }

        this.bot.removeVerifiedUser(this.message.author.id);

        await this.message.channel.send('Your forum account has been unlinked!');
    }
}
