import { VoiceConnection } from 'eris';

interface queueTypes {
    guildName: string
    guildID: string
    connection: VoiceConnection
    songs: Array<songTypes>
    loopMode: number
    volume: number
    previous?: songTypes
    isBassBoosted: boolean
    isPlaying: boolean
    waitTimer?: unknown // Optional
}

interface songTypes {
    title: string
    url: string
    requester: string
    duration: durationTypes
    votesToSkip?: string[] // Optional
    votesToEnd?: string[] // Optional
}

interface durationTypes {
    hours: number
    minutes: number
    seconds: number
}

interface playlistPayload {
    playlistData: playlistDataTypes
    tracks: Array<songTypes>
}

interface playlistDataTypes {
    title: string
    duration: durationTypes
}

export { queueTypes, songTypes, durationTypes, playlistPayload };
