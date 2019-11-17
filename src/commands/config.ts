import { CommandConfig } from '../blueprints/CommandConfig';
import { PermissionLevel } from '../enums/PermissionLevel';
import { MyAccountCommand } from './linked-user/MyAccountCommand';
import { SearchUserCommand } from './linked-user/SearchUserCommand';
import { HelpCommand } from './public/HelpCommand';
import { LinkCommand } from './public/LinkCommand';
import { UnlinkCommand } from './public/UnlinkCommand';

export const commandConfig: CommandConfig[] = [
	{
		key: 'help',
		command: HelpCommand,
		permission: PermissionLevel.public,
	},
	{
		key: 'link',
		command: LinkCommand,
		permission: PermissionLevel.public,
	},
	{
		key: 'unlink',
		command: UnlinkCommand,
		permission: PermissionLevel.public,
	},
	{
		key: 'my-account',
		command: MyAccountCommand,
		permission: PermissionLevel.public,
		requiresLinkedAccount: true,
	},
	{
		key: 'search',
		command: SearchUserCommand,
		permission: PermissionLevel.public,
	},
];
