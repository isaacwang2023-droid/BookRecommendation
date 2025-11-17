import React, { useState, useEffect } from 'react';
import type { User, Book, Tag } from '../types';
import BookCard from './BookCard';
import BookFormModal from './BookFormModal';
import Statistics from './Statistics';
import UserManagement from './UserManagement';
import TagManagement from './TagManagement';
import { ChartBarIcon, UsersIcon, BookOpenIcon, TagIcon } from './icons/Icons';
import { getSystemTags, getAllTags } from '../services/api';


interface AdminDashboardProps {
    user: User;
    books: Book[];
    refreshBooks: () => void;
    allUsers: User[];
    refreshAllUsers: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, books, refreshBooks, allUsers, refreshAllUsers }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [systemTags, setSystemTags] = useState<Tag[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);

    const refreshTags = async () => {
        const [system, all] = await Promise.all([getSystemTags(), getAllTags()]);
        setSystemTags(system);
        setAllTags(all);
    };
    
    useEffect(() => {
        refreshTags();
    }, []);


    const handleEditBook = (book: Book) => {
        setEditingBook(book);
        setIsBookModalOpen(true);
    };

    const handleCloseBookModal = () => {
        setIsBookModalOpen(false);
        setEditingBook(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement users={allUsers} refreshUsers={refreshAllUsers} />;
            case 'books':
                 return (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">所有推荐书目</h3>
                        {books.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {books.map(book => (
                                    <BookCard key={book.id} book={book} onEdit={handleEditBook} refreshBooks={refreshBooks} currentUser={user} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 mt-10">系统中没有图书。</p>
                        )}
                    </div>
                );
            case 'tags':
                return <TagManagement allTags={allTags} systemTags={systemTags} refreshTags={refreshTags} />;
            case 'stats':
            default:
                return <Statistics users={allUsers} books={books} />;
        }
    };
    
    const TabButton: React.FC<{tabName: string; label: string; icon: React.ReactNode}> = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">管理后台</h2>
            <div className="flex flex-wrap gap-2 border-b mb-6 pb-4">
                <TabButton tabName="stats" label="数据统计" icon={<ChartBarIcon className="w-5 h-5"/>} />
                <TabButton tabName="users" label="用户管理" icon={<UsersIcon className="w-5 h-5"/>} />
                <TabButton tabName="books" label="书目管理" icon={<BookOpenIcon className="w-5 h-5"/>} />
                <TabButton tabName="tags" label="标签管理" icon={<TagIcon className="w-5 h-5"/>} />
            </div>
            <div>
                {renderContent()}
            </div>

            {isBookModalOpen && (
                <BookFormModal
                    isOpen={isBookModalOpen}
                    onClose={handleCloseBookModal}
                    book={editingBook}
                    refreshBooks={refreshBooks}
                    user={user}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
