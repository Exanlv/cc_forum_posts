import { Message } from 'discord.js';
import { Bot } from '../bot';
import { PermissionLevel } from '../enums/PermissionLevel';

export abstract class Command {

	/**
     * The message send by the user triggering the command
     */
	public message: Message;

	/**
     * Client of bot
     */
	public bot: Bot;

	/**
     * Permission level of user
     */
	public userPermission: PermissionLevel;

	public constructor(message: Message, bot: Bot, userPermission: PermissionLevel) {
		this.message = message;
		this.bot = bot;
		this.userPermission = userPermission;
	}
}
