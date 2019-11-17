import { Client, Message } from 'discord.js';
import { CommandConfig } from './blueprints/CommandConfig';
import { commandConfig } from './commands/config';
import { UnknownCommand } from './commands/UnknownCommand';
import { hasPermission, getPermissionLevel } from './helper';
import { MissingPermissionCommand } from './commands/MissingPermissionCommand';
import { CubecraftForum } from './Forum/CubecraftForum';
import { DirectMessage } from './Forum/blueprints/DirectMessage';
import { ForumCommandConfig } from './Forum/commands/config';
import { writeFileSync, readdirSync, readFileSync, unlinkSync } from 'fs';
import { ForumCommand } from './Forum/blueprints/ForumCommand';
import { RequiresLinkedUserCommand } from './commands/RequiresLinkedUserCommand';

export class Bot {
    public client: Client;
    private token: string;
    static prefix: string = '--';

    public cubecraftForum: CubecraftForum;

    private commands: Array<CommandConfig>;
    private forumCommands: Array<ForumCommand>;

    public verifiedUsers: {[discordId: string]: string} = {};

    public verifyingUsers: {[discordId: string]: string} = {};

    public constructor(token: string) {
        this.client = new Client();
        this.cubecraftForum = new CubecraftForum(Number(process.env.REFRESHTIMER), process.env.USERNAME, process.env.PASSWORD);
        
        this.token = token;

        this.commands = commandConfig;
        this.forumCommands = ForumCommandConfig;

        this.registerMessageHandler();
        this.registerForumMessageHandler();
        this.loadVerifiedUsers();
    }

    public async startUp(): Promise<void> {
        this.cubecraftForum.on('ready', () => {
            console.log('Cubecraft Forum Bot started');
            
            this.client.login(this.token);
        });

        this.client.on('ready', () => {
            console.log('Discord Bot started!');
        });

        this.cubecraftForum.startUp();
    }

    private registerMessageHandler(): void {
        this.client.on('message', (message: Message) => {
            if (message.content.startsWith(Bot.prefix)) {
                this.handleCommand(message);
            }
        });
    }

    private registerForumMessageHandler(): void {
        this.cubecraftForum.on('directMessage', async (directMessage: DirectMessage) => {
            /**
             * Find class for command used & run the command
             */
            const key = directMessage.message.split('-')[0].toLowerCase();
            const command = this.forumCommands.find(c => c.key === key);

            if (command) {
                const comm = new command.commandClass(directMessage, this);
                comm.run().catch((e) => { });
            }
        });
    }

    private loadVerifiedUsers(): void {
        const dir = `${__dirname}/../data/linked-users`
        let files = readdirSync(dir);

        files.forEach((file) => {
            if (file === '.gitignore') {
                return;
            }

            this.verifiedUsers[file] = readFileSync(`${dir}/${file}`).toString().replace(/[^0-9]/g, "");
        })
    }

    public addVerifiedUser(discordId: string, forumId: string): void {
        this.verifiedUsers[discordId] = forumId;
        writeFileSync(`${__dirname}/../data/linked-users/${discordId}`, forumId);
    }

    public removeVerifiedUser(discordId: string) {
        delete this.verifiedUsers[discordId];
        unlinkSync(`${__dirname}/../data/linked-users/${discordId}`);
    }

    private handleCommand(message: Message): void {
        const command = message.content.substr(Bot.prefix.length).split(' ');

        /**
         * Remove empty entries in case someone types 2 spaces
         */
        for (let i = command.length - 1; i > -1; i--) {
            if (command[i] === '') {
                command.splice(i, 1);
            }
        }

        let commandConfig = this.getCommandConfig(command);

        let commandClass;
        if (commandConfig && commandConfig.command) {
            commandClass = hasPermission(message.member || message.author, commandConfig.permission, this) ? commandConfig.command : MissingPermissionCommand;
        } else {
            commandClass = UnknownCommand;
        }

        if (commandConfig.requiresLinkedAccount && commandConfig.requiresLinkedAccount === true && !this.verifiedUsers[message.author.id]) {
            commandClass = RequiresLinkedUserCommand;
        }
    
        const commandInstance = new commandClass(message, this, getPermissionLevel(message.member || message.author, this));
    
        commandInstance.run().catch(async (e) => {
            /**
             * Bot might not have permission to send messages in channel,
             * if it failed for this reason, it'll fail here once again
             */
            try {
                await message.channel.send(`\`\`\`${e}\`\`\``);
            } catch(e) {
                /**
                 * Reporting the error didnt work, bot appears to be missing 
                 * permission to send messages, notify guild owner (todo)
                 */
            }
        });
    }

    private getCommandConfig(userCommand: Array<string>, availableCommands?: Array<CommandConfig>): CommandConfig {
        availableCommands = availableCommands || this.commands;
        
        let usedCommand = availableCommands.find(c => c.key === userCommand[0]);

        if (usedCommand && usedCommand.subCommands && userCommand.length > 1) {
            return this.getCommandConfig(userCommand.slice(1), usedCommand.subCommands);
        }

        return usedCommand;
    }
}