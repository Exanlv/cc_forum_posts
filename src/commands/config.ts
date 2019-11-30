import { CommandConfig } from '../blueprints/CommandConfig';
import { PermissionLevel } from '../enums/PermissionLevel';
import { EnableLinkRanksCommand } from './admin/link-ranks/EnableLinkRanksCommand';
import { SyncRolesCommand } from './dev/SyncRolesCommand';
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
		key: 'me',
		command: MyAccountCommand,
		permission: PermissionLevel.public,
		requiresLinkedAccount: true,
	},
	{
		key: 'search',
		command: SearchUserCommand,
		permission: PermissionLevel.public,
	},
	{
		key: 'link-ranks',
		permission: PermissionLevel.admin,
		requiresServer: true,
		subCommands: [
			{
				key: 'true',
				requiresServer: true,
				permission: PermissionLevel.public,
				command: EnableLinkRanksCommand,
			},
		],
	},
	{
		key: 'sync-roles',
		permission: PermissionLevel.dev,
		command: SyncRolesCommand,
	},
];
