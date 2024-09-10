export type world = {
    id: string,
    name?: string,
    created_at?: string,
    chapters: Chapter[],
    Events: Event[],
    connections: Connection[],
    timelines: Timeline[],
    pappers: Papper[]
    storyLines: StoryLine[]
}
export type basicWorld = {
    id: string,
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
    order: number
}



export type Chapter = {
    width: number
    height: number
    id: string,
    world_id: string,
    name: string,
    description: string,
    createdAt: string,
    papper_id: string,
    EventID: string,
    timeline_id: string,
    storyline_id: string,
    range: number,
    order: number,
    color: string,
    selected: boolean
}

export type ChapterTimeline =  {
	id  :       string      ,  
	chapter_Id :string     ,   
	timelineID :string,
	range    :  number  ,          
}


export type Connection = {
    id: string,
    sourceChapterID: string,
    targetChapterID: string,
    world_id: string,
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
    leftgap: number,
    edit?: boolean


}


export type StoryLine = {
    id: string,
    WorldsID: string,
    name: string,
    description: string,
    Created_at: string,
    order: number
}




