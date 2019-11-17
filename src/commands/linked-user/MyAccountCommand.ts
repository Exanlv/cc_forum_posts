import { AShowUserCommand } from "./AShowUserCommand";
import { IRunnableCommand } from "../../interfaces/IRunnableCommand";

export class MyAccountCommand extends AShowUserCommand implements IRunnableCommand {
    public requiresLinked = true;

    public async run(): Promise<void> {
        this.message.channel.send('haha yes');
    }
}
