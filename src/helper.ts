import { GuildMember, User } from 'discord.js';
import { Bot } from './bot';
import { PermissionLevel } from './enums/PermissionLevel';

export function hasPermission(member: User|GuildMember, permission: PermissionLevel, bot: Bot): boolean {
	switch (permission) {
		case PermissionLevel.public:
			return true;

		case PermissionLevel.admin:
			return member instanceof GuildMember && member.hasPermission('ADMINISTRATOR');

		case PermissionLevel.dev:
			return process.env.DEVELOPER_IDS.includes(member.id);
	}
}

export function getPermissionLevel(member: User|GuildMember, bot: Bot): PermissionLevel {
	if (hasPermission(member, PermissionLevel.dev, bot)) {
		return PermissionLevel.dev;
	}

	if (hasPermission(member, PermissionLevel.admin, bot)) {
		return PermissionLevel.dev;
	}

	if (hasPermission(member, PermissionLevel.public, bot)) {
		return PermissionLevel.dev;
	}
}

export function generateRandomString(length: number): string {
	const result = [];
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	for (let i = 0; i < length; i++) {
		result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
	}

	return result.join('');
 }
