import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { UserRole } from '@prisma/client';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
  } | null;
  onSave: (userData: {
    id?: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
  }) => void;
}

export default function UserModal({ isOpen, onClose, user, onSave }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState<string | null>(null);
  
  // Сбрасываем форму при открытии/закрытии или изменении пользователя
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setRole(user.role || UserRole.USER);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole(UserRole.USER);
    }
    setError(null);
  }, [user, isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!name.trim()) {
      setError('Необходимо указать имя');
      return;
    }
    
    if (!email.trim()) {
      setError('Необходимо указать email');
      return;
    }
    
    if (!user?.id && !password.trim()) {
      setError('Необходимо указать пароль');
      return;
    }
    
    // Валидация email с помощью регулярного выражения
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Некорректный формат email');
      return;
    }
    
    // Валидация пароля - только если он был введен
    if (password && password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    // Формирование данных
    const userData = {
      ...(user?.id && { id: user.id }),
      name: name.trim(),
      email: email.trim(),
      role,
      ...(password && { password: password.trim() })
    };
    
    onSave(userData);
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {user?.id ? 'Редактирование пользователя' : 'Создание пользователя'}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 cursor-pointer"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md">
                      <div className="flex items-start">
                        <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Ошибка при сохранении пользователя</h4>
                          <p className="text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Пароль {user?.id && '(оставьте пустым, чтобы не менять)'}
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      {...(!user?.id && { required: true })}
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Роль
                    </label>
                    <select
                      id="role"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      required
                    >
                      <option value="USER">Пользователь</option>
                      <option value="MANAGER">Менеджер</option>
                      <option value="ADMIN">Администратор</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                      onClick={onClose}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      {user?.id ? 'Сохранить' : 'Создать'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 