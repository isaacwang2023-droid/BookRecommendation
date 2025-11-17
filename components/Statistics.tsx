import React, { useMemo } from 'react';
import type { Book, User, StatsData } from '../types';
import { UsersIcon, BookOpenIcon, PlusCircleIcon } from './icons/Icons';

interface StatisticsProps {
  users: User[];
  books: Book[];
}

const Statistics: React.FC<StatisticsProps> = ({ users, books }) => {

  const stats: StatsData = useMemo(() => {
    const recommendationsPerUser = users.map(user => ({
      name: user.name,
      count: books.filter(book => book.recommenderId === user.id).length,
    })).sort((a, b) => b.count - a.count);

    return {
      userCount: users.length,
      bookCount: books.length,
      recommendationsPerUser,
    };
  }, [users, books]);

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
        <div className="bg-blue-100 text-blue-600 rounded-full p-3 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">数据概览</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="总用户数" value={stats.userCount} icon={<UsersIcon className="w-6 h-6"/>} />
        <StatCard title="总推荐数" value={stats.bookCount} icon={<BookOpenIcon className="w-6 h-6"/>} />
        <StatCard title="人均推荐" value={stats.userCount > 0 ? parseFloat((stats.bookCount / stats.userCount).toFixed(2)) : 0} icon={<PlusCircleIcon className="w-6 h-6"/>} />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">推荐排行榜</h3>
        <div className="bg-white p-4 rounded-lg shadow">
            <ul className="divide-y divide-gray-200">
                {stats.recommendationsPerUser.slice(0, 10).map((rec, index) => (
                     <li key={rec.name} className="flex justify-between items-center py-3">
                        <div className="flex items-center">
                            <span className="text-gray-500 font-bold w-8 text-center">{index + 1}</span>
                            <span className="font-medium text-gray-800">{rec.name}</span>
                        </div>
                        <span className="text-gray-600 font-semibold">{rec.count} 本</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
