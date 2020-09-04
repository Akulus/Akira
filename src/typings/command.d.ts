import { BitFieldResolvable, PermissionString } from 'discord.js';

interface commandTypes {
    name: string
    description: string
    syntax?: string
    examples?: string[]
    aliases?: string[]
    reqOwner?: boolean
    reqPerms?: BitFieldResolvable<PermissionString>
    isHidden?: boolean
    execute: Function //eslint-disable-line
}

export default commandTypes;
