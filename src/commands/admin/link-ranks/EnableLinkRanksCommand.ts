import { IRunnableCommand } from "../../../interfaces/IRunnableCommand";
import { ServerCommand } from "../../../blueprints/ServerCommand";
import { RankRoles } from "../../../config/RankRoles";
import { jaydenSmithify } from "../../../helper";
import { Role } from "discord.js";

export class EnableLinkRanksCommand extends ServerCommand implements IRunnableCommand {
    public async run(): Promise<void> {
        this.serverConfig.rankLinkingEnabled = true;

        if (this.message.guild.roles.array().length + Object.keys(RankRoles).length > 200) {
            await this.sendMessage('You dont have enough role slots to set up rank linking, consider freeing up some slots.');
            return
        }

        for (let i in RankRoles) {
            try {
                let role = await this.message.guild.createRole({name: jaydenSmithify(i), color: `#${RankRoles[i]}`});
                this.serverConfig.rankRoles[i] = role.id;
            } catch (e) {
                for (let i in this.serverConfig.rankRoles) {
                    let role = this.message.guild.roles.find((r: Role) => r.id === this.serverConfig.rankRoles[i]);

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