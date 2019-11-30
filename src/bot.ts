import { TimingService } from '@exan/timing-service';
import { Client, Guild, GuildMember, Message, Role } from 'discord.js';
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { CommandConfig } from './blueprints/CommandConfig';
import { commandConfig } from './commands/config';
import { MissingPermissionCommand } from './commands/MissingPermissionCommand';
import { RequiresLinkedUserCommand } from './commands/RequiresLinkedUserCommand';
import { RequiresServerCommand } from './commands/RequiresServerCommand';
import { UnknownCommand } from './commands/UnknownCommand';
import { DirectMessage } from './Forum/blueprints/DirectMessage';
import { ForumCommand } from './Forum/blueprints/ForumCommand';
import { ForumCommandConfig } from './Forum/commands/config';
import { CubecraftForum } from './Forum/CubecraftForum';
import { getPermissionLevel, hasPermission } from './helper';
import { ServerConfig } from './ServerConfig';

export class Bot extends TimingService {
	public static prefix: string = '--';
	public client: Client;

	public cubecraftForum: CubecraftForum;

	public verifiedUsers: {[discordId: string]: string} = {};
	public verifyingUsers: {[discordId: string]: string} = {};

	public serverConfigs: {[serverId: string]: ServerConfig} = {};

	private token: string;

	private commands: CommandConfig[];
	private forumCommands: ForumCommand[];

	public constructor(token: string) {
		super();

		this.addEvent('m', 30, 'syncRoles');
		this.on('syncRoles', () => {
			this.linkMinecraftRoles();
		});

		this.client = new Client();
		this.cubecraftForum = new CubecraftForum(Number(process.env.REFRESHTIMER), process.env.USERNAME, process.env.PASSWORD);

		this.token = token;

		this.commands = commandConfig;
		this.forumCommands = ForumCommandConfig;

		this.handleGuildCreate();
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
			this.client.guilds.array().forEach((guild: Guild) => this.handleNewGuild(guild));

			console.log('Discord Bot started!');
		});

		this.cubecraftForum.startUp();
	}

	public addVerifiedUser(discordId: string, forumId: string): void {
		this.verifiedUsers[discordId] = forumId;
		writeFileSync(`${__dirname}/../data/linked-users/${discordId}`, forumId);
	}

	public removeVerifiedUser(discordId: string): void {
		delete this.verifiedUsers[discordId];
		unlinkSync(`${__dirname}/../data/linked-users/${discordId}`);
	}

	public linkMinecraftRoles(): void {
		for (const i in this.serverConfigs) {
			if (this.serverConfigs[i].rankLinkingEnabled) {
				const guild = this.client.guilds.find((g: Guild) => g.id === i);

				if (!guild) {
					continue;
				}

				const roles = {};

				for (const j in this.serverConfigs[i].rankRoles) {
					roles[j] = guild.roles.find((r: Role) => r.id === this.serverConfigs[i].rankRoles[j]);
				}

				guild.members.tap(async (member: GuildMember) => {
					if (this.verifiedUsers[member.id]) {
						const user = await this.cubecraftForum.getUserInfo(this.verifiedUsers[member.id]);

						for (const j in roles) {
							if (user.mcRanks.includes(j)) {
								if (!member.roles.find((r: Role) => r.id === roles[j].id)) {
									member.addRole(roles[j]);
								}
							} else {
								if (member.roles.find((r: Role) => r.id === roles[j].id)) {
									member.removeRole(roles[j]);
								}
							}
						}
					}
				});
			}
		}
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
			const command = this.forumCommands.find((c: ForumCommand) => c.key === key);

			if (command) {
				const comm = new command.commandClass(directMessage, this);
				comm.run().catch((e: any) => { return; });
			}
		});
	}

	private loadVerifiedUsers(): void {
		const dir = `${__dirname}/../data/linked-users`;
		const files = readdirSync(dir);

		files.forEach((file: string) => {
			if (file === '.gitignore') {
				return;
			}

			this.verifiedUsers[file] = readFileSync(`${dir}/${file}`).toString().replace(/[^0-9]/g, '');
		});
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

		const commandConfig = this.getCommandConfig(command);

		let commandClass;
		if (commandConfig && commandConfig.command) {
			commandClass = hasPermission(message.member || message.author, commandConfig.permission, this) ? commandConfig.command : MissingPermissionCommand;
		} else {
			commandClass = UnknownCommand;
		}

		if (commandConfig.requiresServer && !message.guild) {
			commandClass = RequiresServerCommand;
		} else if (commandConfig && commandConfig.requiresLinkedAccount && commandConfig.requiresLinkedAccount === true && !this.verifiedUsers[message.author.id]) {
			commandClass = RequiresLinkedUserCommand;
		}

		const commandInstance = new commandClass(
			message,
			this,
			getPermissionLevel(message.member || message.author, this),
			command,
			message.guild ? this.serverConfigs[message.guild.id] : null,
		);

		commandInstance.run().catch(async (e: any) => {
			/**
             * Bot might not have permission to send messages in channel,
             * if it failed for this reason, it'll fail here once again
             */
			try {
				await message.channel.send(`\`\`\`${e}\`\`\``);
			} catch (e) {
				/**
                 * Reporting the error didnt work, bot appears to be missing
                 * permission to send messages, notify guild owner (todo)
                 */
			}
		});
	}

	private handleGuildCreate(): void {
		this.client.on('guildCreate', (guild: Guild) => {
			this.handleNewGuild(guild);
		});
	}

	private handleNewGuild(guild: Guild): void {
		if (!this.serverConfigs[guild.id]) {
			this.serverConfigs[guild.id] = new ServerConfig(`${__dirname}/../data/server-configs`, guild.id);
		}
	}

	private getCommandConfig(userCommand: string[], availableCommands?: CommandConfig[]): CommandConfig {
		availableCommands = availableCommands || this.commands;

		const usedCommand = availableCommands.find((c: CommandConfig) => c.key === userCommand[0]);

		if (usedCommand && usedCommand.subCommands && userCommand.length > 1) {
			return this.getCommandConfig(userCommand.slice(1), usedCommand.subCommands);
		}

		return usedCommand;
	}
}
