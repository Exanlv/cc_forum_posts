import { CommandConfig } from "../blueprints/CommandConfig";
import { HelpCommand } from "./public/HelpCommand";
import { PermissionLevel } from "../enums/PermissionLevel";
import { LinkCommand } from "./public/LinkCommand";
import { UnlinkCommand } from "./public/UnlinkCommand";
import { MyAccountCommand } from "./linked-user/MyAccountCommand";

export const commandConfig: Array<CommandConfig> = [
    {
        key: 'help',
        command: HelpCommand,
        permission: PermissionLevel.public
    },
    {
        key: 'link',
        command: LinkCommand,
        permission: PermissionLevel.public
    },
    {
        key: 'unlink',
        command: UnlinkCommand,
        permission: PermissionLevel.public
    },
    {
        key: 'my-account',
        command: MyAccountCommand,
        permission: PermissionLevel.public,
        requiresLinkedAccount: true
    }
]