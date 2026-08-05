export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  audioUrl: string;
  duration: number; // in seconds
  releasedAt: string;
  views: number;
}

export interface Novel {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  bannerUrl?: string;
  author: string;
  translator: string;
  synopsis: string;
  category: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  isCompleted: boolean;
  totalChapters: number;
  createdAt: string;
  updatedAt: string;
  chapters?: Chapter[];
}

export interface ListeningHistory {
  novelId: string;
  novelTitle: string;
  novelCover: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  progress: number; // in seconds
  duration: number; // in seconds
  lastListenedAt: string;
}

export type UserRole = 'admin' | 'member' | 'guest';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  providerId: 'email' | 'google' | 'demo';
  favorites: string[]; // array of novel IDs
  listeningHistory: ListeningHistory[];
  createdAt: string;
}
