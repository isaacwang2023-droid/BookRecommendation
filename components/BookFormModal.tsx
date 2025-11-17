import React, { useState, useEffect, useCallback } from 'react';
import type { Book, User, AIBookInfo, Tag } from '../types';
import { addBook, updateBook, getSystemTags } from '../services/api';
import { getBookInfoFromImage } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { CameraIcon, SpinnerIcon, XIcon } from './icons/Icons';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  refreshBooks: () => void;
  user: User;
}

const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, book, refreshBooks, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    publishDate: '',
    reason: '',
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [userTagInput, setUserTagInput] = useState('');
  const [systemTags, setSystemTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isbnError, setIsbnError] = useState('');
  const [aiBookInfo, setAiBookInfo] = useState<AIBookInfo | null>(null);


  useEffect(() => {
    getSystemTags().then(setSystemTags);
  }, []);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        isbn: book.isbn,
        publishDate: book.publishDate,
        reason: book.reason,
      });
      setTags(book.tags);
      setCoverPreview(book.coverUrl || null);
      setCoverFile(null);
    } else {
      // Reset form for new book
      setFormData({
        title: '', author: '', publisher: '', isbn: '', publishDate: '', reason: '',
      });
      setTags([]);
      setCoverPreview(null);
      setCoverFile(null);
    }
    // Reset state when modal opens/changes book
    setIsbnError('');
    setAiBookInfo(null);
  }, [book, isOpen]);

  const validateIsbn = (isbn: string): boolean => {
    if (!isbn.trim()) return true; // Allow empty ISBN
    const cleaned = isbn.replace(/-/g, '');
    const isIsbn10 = /^\d{9}[\dX]$/i.test(cleaned);
    const isIsbn13 = /^\d{13}$/.test(cleaned);
    return isIsbn10 || isIsbn13;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'isbn') {
      if (validateIsbn(value)) {
        setIsbnError('');
      } else {
        setIsbnError('格式无效，应为10位或13位ISBN。');
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setAiBookInfo(null); // Clear previous AI info
      setIsAiLoading(true);
      try {
        const bookInfo = await getBookInfoFromImage(file);
        if (bookInfo && Object.values(bookInfo).some(v => v !== null)) {
            setAiBookInfo(bookInfo);
        } else {
           alert('无法从封面图片中识别图书信息，请手动输入。');
        }
      } catch (error) {
        console.error("AI analysis failed:", error);
        alert('AI识别失败，请检查网络或稍后再试。');
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const handleAdoptAIInfo = () => {
    if (!aiBookInfo) return;
    
    setFormData(prev => ({
        ...prev,
        title: aiBookInfo.title || prev.title,
        author: aiBookInfo.author || prev.author,
        publisher: aiBookInfo.publisher || prev.publisher,
        isbn: aiBookInfo.isbn || prev.isbn,
    }));

    if (aiBookInfo.isbn && !validateIsbn(aiBookInfo.isbn)) {
        setIsbnError('AI识别的ISBN格式可能不正确，请核对。');
    } else if (aiBookInfo.isbn) { // if AI provided a valid ISBN, clear any previous error
        setIsbnError('');
    }
    
    setAiBookInfo(null);
  };

  const handleDiscardAIInfo = () => {
      setAiBookInfo(null);
  };


  const handleTagToggle = (tag: Tag) => {
    setTags(prev => 
      prev.find(t => t.id === tag.id) 
      ? prev.filter(t => t.id !== tag.id) 
      : [...prev, tag]
    );
  };
  
  const addUserTag = () => {
    const trimmedInput = userTagInput.trim();
    if (trimmedInput === '') return;

    const newTag: Tag = { id: uuidv4(), name: trimmedInput, type: 'user' };
    if (!tags.some(t => t.name.toLowerCase() === newTag.name.toLowerCase())) {
        setTags([...tags, newTag]);
    }
    setUserTagInput('');
  };

  const handleAddUserTagOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUserTag();
    }
  };

  const removeTag = (tagId: string) => {
    setTags(tags.filter(t => t.id !== tagId));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isbnError) {
      alert('请修正错误后再提交。');
      return;
    }
    setIsSubmitting(true);
    
    // In a real app, you would upload the coverFile and get a URL
    const coverUrl = coverFile ? URL.createObjectURL(coverFile) : (book?.coverUrl || `https://picsum.photos/seed/${uuidv4()}/300/400`);

    const bookPayload = {
      ...formData,
      tags,
      coverUrl,
      recommenderId: user.id,
      recommenderName: user.name,
    };
    
    try {
      if (book) {
        await updateBook(book.id, bookPayload);
      } else {
        await addBook(bookPayload as Omit<Book, 'id'>);
      }
      refreshBooks();
      onClose();
    } catch (error) {
      console.error('Failed to save book:', error);
      alert('保存失败，请稍后再试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{book ? '修改图书推荐' : '推荐一本新书'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
              <label htmlFor="cover-upload" className={`w-40 h-56 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-gray-400 relative ${isAiLoading ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50 cursor-pointer'}`}>
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <CameraIcon className="w-8 h-8 mb-2" />
                    <span>上传封面</span>
                  </>
                )}
                {isAiLoading && (
                  <div className="absolute inset-0 bg-white/80 flex justify-center items-center rounded-lg">
                    <SpinnerIcon className="w-8 h-8 text-blue-600" />
                  </div>
                )}
              </label>
              <input id="cover-upload" name="coverFile" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" disabled={isAiLoading} />
              <p className="text-xs text-gray-500 mt-2 text-center">上传封面可自动识别信息</p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <input type="text" name="title" placeholder="书名" value={formData.title} onChange={handleInputChange} className="w-full p-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed" required disabled={isAiLoading} />
              <input type="text" name="author" placeholder="作者" value={formData.author} onChange={handleInputChange} className="w-full p-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed" required disabled={isAiLoading} />
              <input type="text" name="publisher" placeholder="出版社" value={formData.publisher} onChange={handleInputChange} className="w-full p-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={isAiLoading} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="isbn"
                    placeholder="ISBN"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed ${isbnError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                    disabled={isAiLoading}
                  />
                  {isbnError && <p className="text-xs text-red-600 mt-1">{isbnError}</p>}
                </div>
                <input type="date" name="publishDate" placeholder="印刷时间" value={formData.publishDate} onChange={handleInputChange} className="w-full p-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={isAiLoading} />
              </div>
            </div>
          </div>
          
          {aiBookInfo && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <h4 className="font-bold text-yellow-800">AI 识别结果</h4>
                  <p className="text-sm text-yellow-700">请确认是否使用以下信息填充表单：</p>
                  <ul className="list-disc list-inside text-sm text-yellow-900 my-2">
                      {aiBookInfo.title && <li><strong>书名:</strong> {aiBookInfo.title}</li>}
                      {aiBookInfo.author && <li><strong>作者:</strong> {aiBookInfo.author}</li>}
                      {aiBookInfo.publisher && <li><strong>出版社:</strong> {aiBookInfo.publisher}</li>}
                      {aiBookInfo.isbn && <li><strong>ISBN:</strong> {aiBookInfo.isbn}</li>}
                  </ul>
                  <div className="space-x-2">
                      <button type="button" onClick={handleAdoptAIInfo} className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">采纳</button>
                      <button type="button" onClick={handleDiscardAIInfo} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">放弃</button>
                  </div>
              </div>
          )}

          <div>
            <textarea name="reason" placeholder="推荐理由..." value={formData.reason} onChange={handleInputChange} className="w-full p-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed" rows={3} required disabled={isAiLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">系统标签</label>
            <div className="flex flex-wrap gap-2">
              {systemTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${tags.find(t => t.id === tag.id) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  disabled={isAiLoading}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">自定义标签</label>
            <div className="relative">
              <input 
                type="text" 
                value={userTagInput}
                onChange={(e) => setUserTagInput(e.target.value)}
                onKeyDown={handleAddUserTagOnEnter}
                placeholder="输入标签后按回车或点击添加"
                className="w-full p-2 border rounded pr-20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isAiLoading}
              />
               <button
                  type="button"
                  onClick={addUserTag}
                  disabled={!userTagInput.trim() || isAiLoading}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-r-md hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                  添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.filter(t => t.type === 'user').map(tag => (
                <span key={tag.id} className="flex items-center bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {tag.name}
                  <button type="button" onClick={() => removeTag(tag.id)} className="ml-2 text-green-600 hover:text-green-800 disabled:cursor-not-allowed disabled:text-gray-400" disabled={isAiLoading}>
                    <XIcon className="w-3 h-3"/>
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end p-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">取消</button>
            <button type="submit" disabled={isSubmitting || isAiLoading || !!isbnError} className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center">
              {isSubmitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
              {book ? '保存修改' : '提交推荐'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookFormModal;