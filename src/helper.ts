import { GuildMember } from "discord.js";
import { PermissionLevel } from "./enums/PermissionLevel";

export function hasPermission(member: GuildMember, permission: PermissionLevel): boolean {
    switch (permission) {
        case PermissionLevel.public:
            return true;

        case PermissionLevel.admin:
            return member.hasPermission('ADMINISTRATOR');
        
        case PermissionLevel.dev:
            return true;
    }
}

export function getPermissionLevel(member: GuildMember): PermissionLevel {
    if (hasPermission(member, PermissionLevel.dev)) {
        return PermissionLevel.dev;
    }

    if (hasPermission(member, PermissionLevel.admin)) {
        return PermissionLevel.dev;
    }

    if (hasPermission(member, PermissionLevel.public)) {
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