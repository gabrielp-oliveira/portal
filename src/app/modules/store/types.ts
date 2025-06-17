export interface StoreFilter {
  searchType: 'books' | 'universes';
  query: string;
  genre?: string;
  author?: string;
  universe?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
