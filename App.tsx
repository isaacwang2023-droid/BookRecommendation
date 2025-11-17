import React, { useState, useEffect, useCallback } from 'react';
import type { User, Book } from './types';
import { login as apiLogin, getBooks, getUserBooks, getPublicBooks, getUsers } from './services/api';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import PublicView from './components/PublicView';
import AdminDashboard from './components/AdminDashboard';

type View = 'public' | 'login' | 'register' | 'dashboard' | 'admin';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('public');
  const [books, setBooks] = useState<Book[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleLogin = async (email: string): Promise<void> => {
    const user = await apiLogin(email);
    if (user) {
      setCurrentUser(user);
      setView(user.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      alert('登录失败，请检查邮箱或密码');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('public');
  };

  const refreshBooks = useCallback(async () => {
    if (!currentUser) {
      const publicBooks = await getPublicBooks();
      setBooks(publicBooks);
    } else if (currentUser.role === 'admin') {
      const allBooks = await getBooks();
      setBooks(allBooks);
    } else {
      const userBooks = await getUserBooks(currentUser.id);
      setBooks(userBooks);
    }
  }, [currentUser]);

  const refreshAllUsers = useCallback(async () => {
    if (currentUser?.role === 'admin') {
        const users = await getUsers();
        setAllUsers(users);
    }
  }, [currentUser]);


  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        await refreshBooks();
        await refreshAllUsers();
        setIsLoading(false);
    }
    fetchData();
  }, [view, currentUser, refreshBooks, refreshAllUsers]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10">加载中...</div>;
    }

    switch (view) {
      case 'login':
        return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
      case 'register':
        return <RegisterForm onRegisterSuccess={() => setView('login')} />;
      case 'dashboard':
        return currentUser && <Dashboard user={currentUser} books={books} refreshBooks={refreshBooks} />;
      case 'admin':
        return currentUser && <AdminDashboard user={currentUser} books={books} refreshBooks={refreshBooks} allUsers={allUsers} refreshAllUsers={refreshAllUsers} />;
      case 'public':
      default:
        return <PublicView books={books} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header user={currentUser} onLogout={handleLogout} setView={setView} />
      <main className="container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>&copy; 2024 BookR. 版权所有。</p>
      </footer>
    </div>
  );
};

export default App;
