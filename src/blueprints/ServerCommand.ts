import { Message } from 'discord.js';
import { Bot } from '../bot';
import { PermissionLevel } from '../enums/PermissionLevel';
import { ServerConfig } from '../ServerConfig';
import { Command } from './Command';

export abstract class ServerCommand extends Command {

	/**
     * Config of server the command is run on
     */
	public serverConfig: ServerConfig;

	constructor(message: Message, bot: Bot, userPermission: PermissionLevel, command: string[], serverConfig: ServerConfig) {
		super(message, bot, userPermission, command);

		this.serverConfig = serverConfig;
	}
}
