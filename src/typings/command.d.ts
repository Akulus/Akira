interface commandTypes {
    name: string
    description: string
    syntax?: string
    examples?: string[]
    aliases?: string[]
    reqPerms?: string[]
    execute: Function //eslint-disable-line
}

export default commandTypes;
