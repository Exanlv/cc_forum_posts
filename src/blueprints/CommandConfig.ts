import { PermissionLevel } from "../enums/PermissionLevel";

export class CommandConfig {
    public key: string;
    public command?: any;
    public permission?: PermissionLevel;
    public subCommands?: Array<CommandConfig>;
    public requiresLinkedAccount?: boolean;
}