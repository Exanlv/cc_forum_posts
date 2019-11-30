import { Command } from "./Command";
import { ServerConfig } from "../ServerConfig";
import { Message } from "discord.js";
import { Bot } from "../bot";
import { PermissionLevel } from "../enums/PermissionLevel";

export abstract class ServerCommand extends Command {
    
    /**
     * Config of server the command is run on
     */
    public serverConfig: ServerConfig;
    
    constructor(message: Message, bot: Bot, userPermission: PermissionLevel, command: Array<string>, serverConfig: ServerConfig) {
        super(message, bot, userPermission, command);

        this.serverConfig = serverConfig;
    }
} 