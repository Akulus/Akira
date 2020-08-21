interface configTypes {
    botInfo: botInfoTypes
    administrators: string[]
    prefix: string | string[]
    musicSettings: musicSettingsTypes
}

interface botInfoTypes {
    botName: string
    description: string
    ownerName: string
}

interface musicSettingsTypes {
    defaultVolume: number
    playlistLimit: number
    djRoleName: string
    enablePresets: boolean
}

export default configTypes;
