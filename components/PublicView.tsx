
import React, { useState, useMemo } from 'react';
import type { Book, User } from '../types';
import BookCard from './BookCard';

interface PublicViewProps {
  books: Book[];
  currentUser: User | null;
}

const PublicView: React.FC<PublicViewProps> = ({ books, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = useMemo(() => {
    if (!searchTerm) {
      return books;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(lowercasedTerm) ||
      book.author.toLowerCase().includes(lowercasedTerm) ||
      book.recommenderName.toLowerCase().includes(lowercasedTerm) ||
      book.tags.some(tag => tag.name.toLowerCase().includes(lowercasedTerm))
    );
  }, [books, searchTerm]);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">图书推荐库</h2>
        <p className="text-gray-500 mt-2">发现、搜索并浏览由社区成员推荐的精彩图书。</p>
      </div>
      
      <div className="mb-6 max-w-lg mx-auto">
        <input
          type="text"
          placeholder="搜索书名、作者、推荐人、标签..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} currentUser={currentUser} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">没有找到匹配的图书。</p>
      )}
    </div>
  );
};

export default PublicView;
