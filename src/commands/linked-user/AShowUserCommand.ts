import { Command } from '../../blueprints/Command';

export abstract class AShowUserCommand extends Command {
    protected getUserEmbed(userId: string) {
        return userId;
    }
}