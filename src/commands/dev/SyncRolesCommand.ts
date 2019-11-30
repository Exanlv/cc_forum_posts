import { Command } from "../../blueprints/Command";
import { IRunnableCommand } from "../../interfaces/IRunnableCommand";

export class SyncRolesCommand extends Command implements IRunnableCommand {
    public async run(): Promise<void> {
        this.bot.linkMinecraftRoles();
    }
}