
import React, { useState } from 'react';
import type { User, Book } from '../types';
import BookCard from './BookCard';
import BookFormModal from './BookFormModal';
import { PlusCircleIcon } from './icons/Icons';

interface DashboardProps {
  user: User;
  books: Book[];
  refreshBooks: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, books, refreshBooks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">我的推荐</h2>
            <p className="text-gray-500 mt-1">管理您推荐的书籍</p>
            <p className="text-sm text-gray-500 mt-2 bg-yellow-100 border-l-4 border-yellow-400 p-2 rounded">您的专属分享链接: <a href={user.uniqueLink} className="font-mono text-blue-600 hover:underline">{user.uniqueLink}</a></p>
          </div>
          <button
              onClick={handleAddNew}
              className="mt-4 md:mt-0 flex items-center justify-center w-full md:w-auto px-6 py-3 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
          >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              推荐新书
          </button>
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map(book => (
            <BookCard key={book.id} book={book} onEdit={handleEdit} refreshBooks={refreshBooks} currentUser={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">您还没有推荐任何书籍。</p>
          <button onClick={handleAddNew} className="mt-4 text-blue-600 hover:underline">现在就推荐一本吧！</button>
        </div>
      )}

      {isModalOpen && (
        <BookFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          book={editingBook}
          refreshBooks={refreshBooks}
          user={user}
        />
      )}
    </div>
  );
};

export default Dashboard;
