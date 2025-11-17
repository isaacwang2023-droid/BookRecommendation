import React from 'react';
import type { Book, User } from '../types';
import { deleteBook } from '../services/api';
import { EditIcon, TrashIcon } from './icons/Icons';

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  refreshBooks?: () => void;
  currentUser?: User | null;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit, refreshBooks, currentUser }) => {

  const isOwner = !!currentUser && currentUser.id === book.recommenderId;
  const isAdmin = !!currentUser && currentUser.role === 'admin';
  const canModify = isOwner || isAdmin;

  const handleDelete = async () => {
    if (window.confirm(`确定要删除《${book.title}》吗？`)) {
      try {
        await deleteBook(book.id);
        if (refreshBooks) {
          refreshBooks();
        }
      } catch (error) {
        console.error("Failed to delete book:", error);
        alert('删除失败，请稍后再试。');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <div className="relative">
        <img 
          src={book.coverUrl || `https://picsum.photos/seed/${book.id}/300/400`} 
          alt={`${book.title} cover`} 
          className="w-full h-48 object-cover" 
        />
        {canModify && onEdit && refreshBooks && (
            <div className="absolute top-2 right-2 flex space-x-2">
                 <button onClick={() => onEdit(book)} className="p-2 bg-white/70 rounded-full text-gray-700 hover:bg-white hover:text-blue-600 backdrop-blur-sm">
                    <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={handleDelete} className="p-2 bg-white/70 rounded-full text-gray-700 hover:bg-white hover:text-red-600 backdrop-blur-sm">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 truncate" title={book.title}>{book.title}</h3>
        <p className="text-sm text-gray-500 mb-2">{book.author}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {book.tags.slice(0, 3).map(tag => (
            <span key={tag.id} className={`px-2 py-1 text-xs rounded-full ${tag.type === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {tag.name}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 flex-grow mb-3 line-clamp-3">推荐理由: {book.reason}</p>
        <div className="border-t pt-2 mt-auto text-xs text-gray-400">
            <p>推荐人: {book.recommenderName}</p>
            <p>出版社: {book.publisher}</p>
        </div>
      </div>
    </div>
  );
};

export default BookCard;