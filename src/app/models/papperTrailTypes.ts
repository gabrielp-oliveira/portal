export type world = {
    id?: string,
    name?: string,
    created_at?: string,
    Chapters: Chapter[],
    Events: Event[],
    Connections: Connection[],
    Timelines: Timeline[],
    Pappers: Papper[]
}
export type basicWorld = {
    id?: string,
    name?: string,
    created_at?: string,
}


export type Papper = {
    id: string,
    name: string,
    Description: string,
    Path: string,
    Created_at: string,
    World_id: string,
}


export type Chapter = {
    id: string,
    WorldsID: string,
    name: string,
    Description: string,
    CreatedAt: string,
    PapperID: string,
    EventID: string,
    TimelineID: string,
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
    Date: string,
}




