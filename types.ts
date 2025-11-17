
export interface User {
  id: string;
  name: string;
  major: string;
  phone: string;
  email: string;
  expertise: string;
  role: 'user' | 'admin';
  uniqueLink: string;
}

export interface Tag {
  id: string;
  name: string;
  type: 'system' | 'user';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  publishDate: string;
  reason: string;
  tags: Tag[];
  coverUrl?: string;
  recommenderId: string;
  recommenderName: string;
}

export interface BookFormData {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  publishDate: string;
  reason: string;
  tags: string[]; // Store as string array for form handling
  coverFile?: FileList;
}

export interface AIBookInfo {
  title: string | null;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
}

export interface StatsData {
    userCount: number;
    bookCount: number;
    recommendationsPerUser: { name: string; count: number }[];
}
