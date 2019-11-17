import { Message, Client } from "discord.js";
import { PermissionLevel } from "../enums/PermissionLevel";
import { Bot } from "../bot";

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