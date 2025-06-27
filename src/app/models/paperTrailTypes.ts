export type world = {
    id: string,
    name: string,
    description: string,
    created_at?: string,
    chapters: Chapter[],
    events: Event[],
    connections: Connection[],
    timelines: Timeline[],
    papers: paper[]
    storyLines: StoryLine[]
    groupConnections: GroupConnection[],
    subway_settings: Subway_Settings,
    CoverURLs: string[], // ✅ NOVO
    PaperCount: number      // ✅ NOVO
    Genres: string[],
    Authors: string[]
}

export type info<t> = {
    message: string,
    status: string,
    data: t
}
export interface ExtendedChapter extends Chapter {
    papperName: string,
    timelineName: string,
    storylineName: string,
    papperOrder: number
    // eventName:string
}

export type basicWorld = {
    id: string,
    name?: string,
    created_at?: string,
    description?: string
}


export type paper = {
    id: string;
    name: string;
    description: string;
    path: string;
    created_at: string;
    publisher: string;
    world_id: string;
    world_name: string;
    status: "not_available" | "in_progress" | "available";
    priceAmount: number;
    priceCurrency: string;
    priceCountry: string;
    order: number;
    color: string;

    author_id: string;
    author_name: string;

    language: string;
    year: number;

    cover_url: string;
    genre: string[];
    maturity: string;

    isbn_10: string;
    isbn_13: string;
    categories: string[];

    total_pages: number;

    // Campos extras opcionais usados no front
    chapter?: Chapter[];
    focus?: boolean;
    visible?: boolean;
};



export interface StoreFilter {
    searchType: 'books' | 'universes';
    query?: string; // agora pode ser omitido
    genre?: string;
    author?: string;
    universe?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    quantity: number;
    startIndex?: number;
    status?: 'available' | 'not_available' | 'in_progress'
}



export interface createWorld extends infoDialog {
    "world": world,
}

export type infoDialog = {
    status: 'warning' | 'error' | 'success',
    header: string,
    message: string,
    action: String
}
export type ChapterDetails = {
    chapter: Chapter,
    timeline: Timeline,
    storyLine: StoryLine,
    documentUrl: string,
    events: Event[],
    color: string,
    next: Chapter,
    prev: Chapter,
    relatedChapters: relatedChapter[]
}
export type chapterBasicInfo = {
    id: string;
    title: string;
}

export type description = {
    id: string,
    resource_type: string,
    resource_id?: string,
    description_data?: string
    name?: string
}
export type relatedChapter = {
    "chapterID": string,
    "relatedChapter": chapterBasicInfo,
    "groupName": string,
    "groupColor": string
}

export type GroupConnection = {
    focus: any
    id: string,
    name: string,
    description: string,
    world_id: string,
    color: string,
}



export type Chapter = {
    width: number
    height: number
    id: string,
    world_id: string,
    title: string,
    description: string,
    created_at: string,
    paper_id: string,
    event_Id: string,
    timeline_id: string | null,
    storyline_id: string,
    range: number,
    pageCount: number,
    order: number,
    color: string,
    selected: boolean,
    focus: boolean,
    visible?: boolean,
    completed?: boolean
    favorite?: boolean
    annotations?: ChapterAnnotation[]
}

export type ChapterTimeline = {
    id: string,
    chapter_Id: string,
    timelineID: string,
    range: number,
}


export type Connection = {
    id: string,
    sourceChapterID: string,
    targetChapterID: string,
    world_id: string,
    color: string,
    group_id: string | null,
    focus?: boolean

}
export type Subway_Settings = {
    id: string,
    chapter_names: boolean,
    display_table_chapters: boolean,
    timeline_update_chapter: boolean,
    storyline_update_chapter: boolean,
    show_span_favorite: boolean,
    theme: boolean,
    group_connection_update_chapter: boolean,
    user_id: string,
    k: number,
    x: number,
    y: number,
    world_id: string
};



export type Event = {
    id: string,
    name: string,
    description: string,
    world_id: string,
    range: number,
    startRange: number
}





export type Timeline = {
    id: string,
    world_id: string,
    name: string,
    description: string,
    order: number,
    range: number,
    created_at: string,
    edit?: boolean,
    visible: boolean


}


export type StoryLine = {
    id: string,
    world_id: string,
    name: string,
    description: string,
    Created_at: string,
    order: number
}




export interface ChapterAnnotation {
    id?: string; // Gerado no backend
    user_id: string;
    chapter_id: string;
    paper_id: string;
    world_id: string;
    favorite: boolean;
    span_id?: string;       // Opcional, para identificação do trecho no HTML
    span_text?: string;     // Opcional, texto destacado
    note: string;           // Conteúdo da anotação
    created_at?: string;    // ISO timestamp
    last_updated?: string;  // ISO timestamp
    position?: any;         // JSON com dados de posição (opcional, ex: { x: 10, y: 50 })
}

export interface ChapterConfiguration {
    id: string;
    user_id: string;
    world_id: string;
    paper_id: string;
    chapter_id: string;
    completed: boolean;
    favorite: boolean;
    created_at: string;  // ou Date, se você for converter
    updated_at: string;  // ou Date, se você for converter
}


export interface paperCard {
    paper: paper,
    chapterList: Chapter[]
}