import type { User, Book, Tag } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- Mock Database ---

let mockUsers: User[] = [
    {
      id: 'user-1',
      name: '张三',
      major: '计算机科学',
      phone: '13800138000',
      email: 'user@example.com',
      expertise: '前端开发, React',
      role: 'user',
      uniqueLink: 'https://bookr.example.com/invite/a1b2c3d4',
    },
    {
      id: 'admin-1',
      name: '管理员',
      major: '信息管理',
      phone: '13900139000',
      email: 'admin@example.com',
      expertise: '系统管理',
      role: 'admin',
      uniqueLink: 'https://bookr.example.com/invite/x9y8z7w6',
    },
];

let mockSystemTags: Tag[] = [
    { id: 'tag-1', name: '计算机科学', type: 'system' },
    { id: 'tag-2', name: '文学', type: 'system' },
    { id: 'tag-3', name: '历史', type: 'system' },
    { id: 'tag-4', name: '五星推荐', type: 'system' },
    { id: 'tag-5', name: '四星推荐', type: 'system' },
];

export let mockBooks: Book[] = [
  {
    id: 'book-1',
    title: '深入理解计算机系统',
    author: 'Randal E. Bryant',
    publisher: '机械工业出版社',
    isbn: '9787111562286',
    publishDate: '2016-11-01',
    reason: '计算机专业的圣经，必读！',
    tags: [
        { id: 'tag-1', name: '计算机科学', type: 'system' },
        { id: 'tag-4', name: '五星推荐', type: 'system' },
        { id: 'user-tag-1', name: 'CSAPP', type: 'user' }
    ],
    coverUrl: 'https://picsum.photos/seed/csapp/300/400',
    recommenderId: 'user-1',
    recommenderName: '张三',
  },
  {
    id: 'book-2',
    title: '三体',
    author: '刘慈欣',
    publisher: '重庆出版社',
    isbn: '9787229160935',
    publishDate: '2021-08-01',
    reason: '中国科幻的巅峰之作。',
    tags: [
        { id: 'tag-2', name: '文学', type: 'system' },
        { id: 'tag-4', name: '五星推荐', type: 'system' },
    ],
    coverUrl: 'https://picsum.photos/seed/santi/300/400',
    recommenderId: 'admin-1',
    recommenderName: '管理员',
  },
];

// --- Helper ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Auth API ---
export const login = async (email: string): Promise<User | null> => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    return user || null;
};

export const register = async (userData: Omit<User, 'id' | 'role' | 'uniqueLink'>): Promise<User> => {
    await delay(1000);
    const newUser: User = {
        ...userData,
        id: uuidv4(),
        role: 'user',
        uniqueLink: `https://bookr.example.com/invite/${uuidv4()}`
    };
    mockUsers.push(newUser);
    return newUser;
};

// --- Book API ---
export const getPublicBooks = async (): Promise<Book[]> => {
    await delay(300);
    return [...mockBooks];
};

export const getUserBooks = async (userId: string): Promise<Book[]> => {
    await delay(300);
    return mockBooks.filter(b => b.recommenderId === userId);
};

export const getBooks = async (): Promise<Book[]> => {
    await delay(300);
    return [...mockBooks];
};

export const addBook = async (bookData: Omit<Book, 'id'>): Promise<Book> => {
    await delay(700);
    const newBook: Book = { ...bookData, id: uuidv4() };
    mockBooks.unshift(newBook);
    return newBook;
};

export const updateBook = async (bookId: string, bookData: Partial<Book>): Promise<Book> => {
    await delay(700);
    let bookToUpdate = mockBooks.find(b => b.id === bookId);
    if (bookToUpdate) {
        Object.assign(bookToUpdate, bookData);
        return { ...bookToUpdate };
    }
    throw new Error("Book not found");
};

export const deleteBook = async (bookId: string): Promise<void> => {
    await delay(500);
    mockBooks = mockBooks.filter(b => b.id !== bookId);
};

// --- Tag API ---
export const getSystemTags = async (): Promise<Tag[]> => {
    await delay(100);
    return [...mockSystemTags];
};

export const getAllTags = async (): Promise<Tag[]> => {
    await delay(200);
    const allBookTags = mockBooks.flatMap(book => book.tags);
    const uniqueTags = new Map<string, Tag>();
    [...mockSystemTags, ...allBookTags].forEach(tag => {
        uniqueTags.set(tag.name.toLowerCase(), tag);
    });
    return Array.from(uniqueTags.values());
};

export const addSystemTag = async (tagName: string): Promise<Tag> => {
    await delay(400);
    const newTag: Tag = { id: uuidv4(), name: tagName, type: 'system' };
    mockSystemTags.push(newTag);
    return newTag;
};

export const deleteSystemTag = async (tagId: string): Promise<void> => {
    await delay(400);
    // Note: In a real app, you'd check if the tag is in use.
    mockSystemTags = mockSystemTags.filter(t => t.id !== tagId);
}

// --- User API (for Admins) ---
export const getUsers = async (): Promise<User[]> => {
    await delay(300);
    return [...mockUsers];
};

export const addUser = async (userData: Omit<User, 'id' | 'uniqueLink'>): Promise<User> => {
    await delay(700);
    const newUser: User = {
        ...userData,
        id: uuidv4(),
        uniqueLink: `https://bookr.example.com/invite/${uuidv4()}`,
    };
    mockUsers.push(newUser);
    return newUser;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    await delay(700);
    let userToUpdate = mockUsers.find(u => u.id === userId);
    if (userToUpdate) {
        Object.assign(userToUpdate, userData);
        return { ...userToUpdate };
    }
    throw new Error("User not found");
};

export const deleteUser = async (userId: string): Promise<void> => {
    await delay(500);
    // You might want to handle what happens to the user's books. Here we just delete the user.
    mockUsers = mockUsers.filter(u => u.id !== userId);
};
