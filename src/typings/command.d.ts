interface commandTypes {
    name: string
    description: string
    category: string
    syntax?: string
    examples?: string[]
    aliases?: string[]
    permissionLevel: number
    cooldown: number // Counted in seconds
    execute: Function //eslint-disable-line
}

export default commandTypes;
