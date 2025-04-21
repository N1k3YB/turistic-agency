import { UserRole } from '@prisma/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: UserRole;
    emailVerified: Date | null;
    _count: {
      reviews: number;
    };
  };
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export default function UserRow({ user, onEdit, onDelete }: UserRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.id.substring(0, 8)}...
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'Пользователь'}
              width={32}
              height={32}
              className="rounded-full mr-3"
            />
          ) : (
            <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
          )}
          <div className="text-sm font-medium text-gray-900">
            {user.name || 'Неизвестный пользователь'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : 
          user.role === "MANAGER" ? "bg-blue-100 text-blue-800" : 
          "bg-gray-100 text-gray-800"
        }`}>
          {user.role === "ADMIN" ? "Администратор" : 
           user.role === "MANAGER" ? "Менеджер" : "Пользователь"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.emailVerified ? 
          format(new Date(user.emailVerified), 'd MMMM yyyy', { locale: ru }) : 
          'Не подтвержден'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user._count.reviews}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onEdit(user.id)}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-red-600 hover:text-red-800"
            onClick={() => onDelete(user.id)}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
} 