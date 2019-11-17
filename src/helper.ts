import { GuildMember } from "discord.js";
import { PermissionLevel } from "./enums/PermissionLevel";
import { Bot } from "./bot";

export function hasPermission(member: GuildMember, permission: PermissionLevel, bot: Bot): boolean {
    switch (permission) {
        case PermissionLevel.public:
            return true;

        case PermissionLevel.linkedUser:
            return !!bot.verifiedUsers[member.id];

        case PermissionLevel.admin:
            return member.hasPermission('ADMINISTRATOR');
        
        case PermissionLevel.dev:
            return process.env.DEVELOPER_IDS.includes(member.id);
    }
}

export function getPermissionLevel(member: GuildMember, bot: Bot): PermissionLevel {
    if (hasPermission(member, PermissionLevel.dev, bot)) {
        return PermissionLevel.dev;
    }

    if (hasPermission(member, PermissionLevel.admin, bot)) {
        return PermissionLevel.dev;
    }

    if (hasPermission(member, PermissionLevel.linkedUser, bot)) {
        return PermissionLevel.linkedUser;
    }

    if (hasPermission(member, PermissionLevel.public, bot)) {
        return PermissionLevel.dev;
    }
}

export function generateRandomString(length: number): string {
    let result = [];
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < length; i++) {
       result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
    }

    return result.join('');
 }