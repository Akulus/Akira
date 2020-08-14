interface configTypes {
    keys?: keysTypes
    botOptions?: botOptTypes
    playerOptions?: playerOptTypes
}

interface keysTypes {
    botToken?: string
    youtubeAPI?: string
}

interface botOptTypes {
    owners?: string[]
    prefix?: string
    shardCount?: number
    isPersonal?: boolean
    enableCooldowns?: boolean
}

interface playerOptTypes {
    defaultVolume?: number
    djRoleName?: string
    playlistLimit?: number
    enablePresets?: boolean
}

export default configTypes;
