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
    djRoleName: string
    enablePresets: boolean
    timeAfterBotShouldLeave: number
}

export default configTypes;
