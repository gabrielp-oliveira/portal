export type world = {
    id: string,
    name: string,
    created_at: string,
}


export type Papper = {
    ID: string,
    Name: string,
    Description: string,
    Path: string,
    Created_at: string,
    World_id: string,
}


export type Chapter = {
    Id: string,
    WorldsID: string,
    Name: string,
    Description: string,
    CreatedAt: string,
    PapperID: string,
    EventID: string,
    TimelineID: string,
}
