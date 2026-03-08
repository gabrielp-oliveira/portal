export type world = {
    id: string,
    name: string,
    description: string,
    created_at?: string,
    language?: string,
    main_genre?: string[],
    chapters: Chapter[],
    events: Event[],
    connections: Connection[],
    timelines: Timeline[],
    papers: paper[]
    storyLines: StoryLine[]
    groupConnections: GroupConnection[],
    subway_settings: Subway_Settings,
    CoverURLs: string[],
    PaperCount: number,
    Genres: string[],
    Authors: string[],
    price?: number,
    original_price?: number,
    price_currency?: string,
    price_country?: string,
}

export type info<t> = {
    message: string,
    status: string,
    data: t
}
export interface ExtendedChapter extends Chapter {
    paperName: string,
    timelineName: string,
    storylineName: string,
    paperOrder: number
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
    AlreadyPurchased: boolean;
    publisher: string;
    world_id: string;
    world_name: string;
    status: "not_available" | "in_progress" | "available";
    price: number;
    priceCurrency: string;
    priceCountry: string;
    order: number;
    color: string;

    author_id: string;
    author_name: string;
    author: string;
    language: string;
    year: number;

    cover_url: string;
    genre: string[];
    maturity: string;

    isbn_10: string;
    isbn_13: string;
    categories: string[];

    total_pages: number;

    original_price?: number;
    discount_pct?: number;
    already_purchased?: boolean;
    is_in_wishlist?: boolean;
    price_currency?: string;
    price_country?: string;
    subscription_price?: number;

    // Campos extras opcionais usados no front
    chapter?: Chapter[];
    focus?: boolean;
    visible?: boolean;
    isPurchased?: boolean;
    favorite?: boolean;
    completed?: boolean;
};



export interface StoreFilter {
    searchType: 'books' | 'universes';
    query?: string;
    genre?: string;
    author?: string;
    universe?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    status?: 'available' | 'not_available' | 'in_progress';
    language?: string;
    maturity?: string;
    year?: number;
    price_min?: number;
    price_max?: number;
    country?: string;
    currency?: string;
    purchased?: boolean;
}

export interface chapterDetailsModal {
      chapter: Chapter;
      paper: paper;
      link: string;
    
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
    timeline_id: string,
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
    world_id: string,
    collapsed_all: boolean,
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


export interface DashboardStats {
  total_worlds: number;
  total_papers: number;
  total_chapters: number;
  completed_chapters: number;
  favorite_chapters: number;
  total_annotations: number;
  total_pages: number;
  pages_read: number;
}

export interface DashboardWeeklyActivity {
  chapters_completed: number;
  pages_read: number;
  annotations: number;
}

export interface DashboardReadingStreak {
  current_days: number;
  best_days: number;
}

export interface DashboardContinueReading {
  chapter_id: string;
  title: string;
  order: number;
  paper_id: string;
  paper_name: string;
  cover_url: string;
  color: string;
  last_read_at: string;
  world_id?: string;
  world_name?: string;
}

export interface DashboardGenreBreakdown {
  genre: string;
  book_count: number;
}

export interface DashboardRecentlyRead {
  chapter_id: string;
  title: string;
  description: string;
  order: number;
  paper_id: string;
  paper_name: string;
  cover_url: string;
  color: string;
  last_read_at: string;
  world_id?: string;
  world_name?: string;
  world_summary?: string;
}

export interface DashboardPaperInProgress {
  id: string;
  name: string;
  cover_url: string;
  color: string;
  author_name: string;
  total_chapters: number;
  completed_chapters: number;
  world_id?: string;
  world_name?: string;
}

export interface DashboardRecentlyCompleted {
  paper_id: string;
  name: string;
  cover_url: string;
  color: string;
  author_name: string;
  completed_at: string;
  world_id?: string;
  world_name?: string;
}

export interface DashboardNotStarted {
  paper_id: string;
  name: string;
  cover_url: string;
  color: string;
  author_name: string;
  total_chapters: number;
  added_at: string;
  world_id?: string;
  world_name?: string;
}

export interface DashboardRecentChapter {
  chapter_id: string;
  title: string;
  last_update: string;
  paper_id: string;
  paper_name: string;
  color: string;
  world_id?: string;
  world_name?: string;
}

export interface DashboardFavoriteChapter {
  chapter_id: string;
  title: string;
  description?: string;
  order: number;
  paper_id: string;
  paper_name: string;
  color: string;
  world_id?: string;
  world_name?: string;
}

export interface DashboardFavoriteAnnotation {
  id: string;
  span_text: string;
  note: string;
  chapter_id: string;
  chapter_title: string;
  chapter_order?: number;
  paper_id: string;
  paper_name: string;
  created_at: string;
  world_id?: string;
  world_name?: string;
}

export interface DashboardWorldSummary {
  world_id: string;
  name: string;
  papers_count: number;
  chapters_count: number;
  completed_count: number;
}

export interface DashboardWishlistItem {
  paper_id: string;
  name: string;
  cover_url: string;
  author_name: string;
  world_name?: string;
  wishlisted_at: string;
}

export interface DashboardRecommended {
  paper_id: string;
  name: string;
  cover_url: string;
  color: string;
  author_name: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  weekly_activity: DashboardWeeklyActivity;
  reading_streak: DashboardReadingStreak;
  continue_reading: DashboardContinueReading | null;
  recently_read: DashboardRecentlyRead[];
  papers_in_progress: DashboardPaperInProgress[];
  recently_completed: DashboardRecentlyCompleted[];
  not_started: DashboardNotStarted[];
  recently_updated: DashboardRecentChapter[];
  favorite_chapters: DashboardFavoriteChapter[];
  favorite_annotations: DashboardFavoriteAnnotation[];
  worlds_summary: DashboardWorldSummary[];
  wishlist_available: DashboardWishlistItem[];
  recommended: DashboardRecommended[];
  genre_breakdown: DashboardGenreBreakdown[];
}

/** Lightweight response for the /dashboard/hero endpoint — loaded first to unblock LCP. */
export interface DashboardHeroStats {
  total_papers: number;
  completed_chapters: number;
}

export interface DashboardHeroResponse {
  continue_reading: DashboardContinueReading | null;
  papers_in_progress: DashboardPaperInProgress[];
  stats: DashboardHeroStats;
  reading_streak: DashboardReadingStreak;
}

export interface paperCard {
    paper: paper,
    chapterList: Chapter[]
}
export interface UserChapterDetailsResponse {
  chapters: {
    ID: string;
    Title: string;
    Description: string;
    CreatedAt: string;
    Order: number;
    PaperID: string;
    PaperName: string;
    WorldID: string;
    TimelineID: string;
    TimelineName: string;
    TimelineDesc: string;
    StorylineID: string;
    StorylineName: string;
    StorylineDesc: string;
    Favorite: boolean;
    Completed: boolean;
    EventID?: string;
    Range?: number;
    PageCount?: number;
    HasAnnotations?: boolean;
    AnnotationsCount?: number;
  };
}
