export type world = {
    id?: string,
    name?: string,
    created_at?: string,
    chapters: Chapter[],
    Events: Event[],
    Connections: Connection[],
    Timelines: Timeline[],
    Pappers: Papper[]
    storyLines: StoryLine[]
}
export type basicWorld = {
    id?: string,
    name?: string,
    created_at?: string,
}


export type Papper = {
    id: string,
    name: string,
    description: string,
    Path: string,
    Created_at: string,
    world_id: string,
    chapter?: Chapter[],
    order?: number
}


export type Chapter = {
    id: string,
    world_id: string,
    name: string,
    description: string,
    createdAt: string,
    papper_id: string,
    EventID: string,
    TimelineID: string,
    order?: number

}

export type Connection = {
    id: string,
    SourceChapterID: string,
    TargetChapterID: string,
}
export type Event = {
    id: string,
    name: string,
    Start_date: string,
    End_date: string,
    World_id: string,
}





export type Timeline = {
    id: string,
    WorldsID: string,
    name: string,
    description: string,
    order: number,
    range: number,
    created_at: string,


}


export type StoryLine = {
    id: string,
    WorldsID: string,
    name: string,
    description: string,
    Created_at: string,
    order: number
}




