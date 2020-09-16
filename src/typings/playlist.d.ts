interface playlistTypes {
    title: string
    tag: string
    author?: string
    songs: Array<trackTypes>
}

interface trackTypes {
    title?: string
    author?: string
    url: string
}

export { playlistTypes, trackTypes };
