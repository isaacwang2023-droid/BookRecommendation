
import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  setView: (view: 'public' | 'login' | 'register' | 'dashboard' | 'admin') => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, setView }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <h1 
            className="text-2xl font-bold text-slate-800 cursor-pointer"
            onClick={() => setView(user ? (user.role === 'admin' ? 'admin' : 'dashboard') : 'public')}
        >
          BookR <span className="text-blue-600">推荐</span>
        </h1>
        <nav>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden md:block">欢迎, {user.name}</span>
               {user.role === 'admin' && (
                <button
                  onClick={() => setView('admin')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  管理后台
                </button>
              )}
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                退出登录
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <button
                onClick={() => setView('login')}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-transparent rounded-md hover:bg-blue-50"
              >
                登录
              </button>
              <button
                onClick={() => setView('register')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                注册
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
