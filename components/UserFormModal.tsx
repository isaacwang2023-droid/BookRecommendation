import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { addUser, updateUser } from '../services/api';
import { XIcon, SpinnerIcon } from './icons/Icons';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  refreshUsers: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, user, refreshUsers }) => {
  const [formData, setFormData] = useState({
    name: '',
    major: '',
    phone: '',
    email: '',
    expertise: '',
    role: 'user' as 'user' | 'admin',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        major: user.major,
        phone: user.phone,
        email: user.email,
        expertise: user.expertise,
        role: user.role,
      });
    } else {
      setFormData({
        name: '', major: '', phone: '', email: '', expertise: '', role: 'user',
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (user) {
        await updateUser(user.id, formData);
      } else {
        await addUser(formData);
      }
      refreshUsers();
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('保存失败，请稍后再试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{user ? '修改用户信息' : '新增用户'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" type="text" required value={formData.name} className="w-full p-2 border rounded" placeholder="姓名" onChange={handleChange} />
            <input name="email" type="email" required value={formData.email} className="w-full p-2 border rounded" placeholder="邮箱" onChange={handleChange} />
            <input name="major" type="text" required value={formData.major} className="w-full p-2 border rounded" placeholder="学科专业" onChange={handleChange} />
            <input name="phone" type="tel" required value={formData.phone} className="w-full p-2 border rounded" placeholder="手机" onChange={handleChange} />
          </div>
          <input name="expertise" type="text" value={formData.expertise} className="w-full p-2 border rounded" placeholder="个人专长" onChange={handleChange} />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">用户角色</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
           <div className="flex justify-end p-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">取消</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center">
              {isSubmitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
              {user ? '保存修改' : '创建用户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
