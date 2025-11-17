
import React, { useState } from 'react';
import { register } from '../services/api';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    major: '',
    phone: '',
    email: '',
    expertise: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { password, ...userData } = formData;
      // In a real app, password would be used
      console.log('Registering with password:', password);
      const newUser = await register(userData);
      alert(`注册成功！您的专属链接是：${newUser.uniqueLink}`);
      onRegisterSuccess();
    } catch (error) {
      alert('注册失败，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建新账户
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input name="name" type="text" required className="w-full p-2 border rounded" placeholder="姓名" onChange={handleChange} />
          <input name="major" type="text" required className="w-full p-2 border rounded" placeholder="学科专业" onChange={handleChange} />
          <input name="phone" type="tel" required className="w-full p-2 border rounded" placeholder="手机" onChange={handleChange} />
          <input name="email" type="email" required className="w-full p-2 border rounded" placeholder="邮箱" onChange={handleChange} />
          <input name="expertise" type="text" className="w-full p-2 border rounded" placeholder="个人专长 (如: AI, 历史)" onChange={handleChange} />
          <input name="password" type="password" required className="w-full p-2 border rounded" placeholder="密码" onChange={handleChange} />
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
