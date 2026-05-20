export interface Book {
  id: string;
  book_code: string;

  isbn: string;
  title: string;
  author: string;
  category: string;

  published_year: number;
  copies_total: number;
  available_copies: number;

  book_cover_url: string;
  description: string;
  publisher: string;
}
/**
 * Frontend Form State
 */
export interface BookForm {
  isbn: string;
  title: string;
  author: string;
  category: string;

  year: number;
  copies: number;
  available: number;

  cover: string;
  description: string;
  publisher: string;
}

/**
 * Backend Payload Structure
 */
export interface BookPayload {
  isbn: string;
  title: string;
  author: string;
  category: string;

  published_year: number;
  copies_total: number;                                                                                                                                                                                                                         

  book_cover_url: string;
  description: string;
  publisher: string;
}