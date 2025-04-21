'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ImageWithFallback from '@/components/ImageWithFallback';

interface DestinationData {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  _count?: {
    tours: number;
  };
}

export default function EditDestinationPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const destinationId = params.id;
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<DestinationData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      const userRole = session?.user?.role;
      if (userRole !== 'ADMIN') {
        router.push('/');
        return;
      }
      
      fetchDestinationData();
    }
  }, [status, session, router, destinationId]);
  
  const fetchDestinationData = async () => {
    try {
      setLoadingData(true);
      setLoadError('');
      
      const response = await fetch(`/api/admin/destinations/${destinationId}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные направления');
      }
      
      const data = await response.json();
      const destinationData = data.destination || data;
      setOriginalData(destinationData);
      
      setName(destinationData.name || '');
      setSlug(destinationData.slug || '');
      setDescription(destinationData.description || '');
      setImageUrl(destinationData.imageUrl || '');
      
    } catch (error: any) {
      console.error('Ошибка при загрузке данных направления:', error);
      setLoadError(error.message || 'Не удалось загрузить данные направления');
      toast.error('Не удалось загрузить данные направления');
    } finally {
      setLoadingData(false);
    }
  };
  
  const generateSlug = () => {
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^\w\sа-яё-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/[а-яё]/g, char => {
        const cyrillicToLatin: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return cyrillicToLatin[char] || char;
      });
    
    setSlug(generatedSlug);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Название направления обязательно';
    if (!slug.trim()) newErrors.slug = 'URL-идентификатор обязателен';
    if (!description.trim()) newErrors.description = 'Описание обязательно';
    if (!imageUrl.trim()) newErrors.imageUrl = 'URL изображения обязателен';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    try {
      setLoading(true);
      
      const destinationData = {
        name,
        slug,
        description,
        imageUrl
      };
      
      const response = await fetch(`/api/admin/destinations/${destinationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(destinationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении направления');
      }
      
      toast.success('Направление успешно обновлено');
      router.push('/admin/destinations');
    } catch (error: any) {
      console.error('Ошибка при обновлении направления:', error);
      toast.error(error.message || 'Произошла ошибка при обновлении направления');
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 p-4 rounded-xl shadow max-w-md">
          <h2 className="text-red-800 text-xl font-bold mb-2">Ошибка</h2>
          <p className="text-red-700">{loadError}</p>
          <div className="mt-4">
            <Link href="/admin/destinations" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Вернуться к списку направлений
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/admin/destinations" className="text-blue-600 hover:text-blue-800 flex items-center mb-6">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Вернуться к списку направлений
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Редактирование направления: {originalData?.name}</h1>
        
        {originalData?._count?.tours && originalData._count.tours > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Внимание:</strong> С этим направлением связано {originalData._count.tours} тур(ов). Изменение названия или URL может повлиять на существующие туры.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Название направления *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={generateSlug}
                className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Название направления"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL-идентификатор *
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="url-identifier"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Создать
                </button>
              </div>
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL изображения *
              </label>
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Описание направления"
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 gap-4">
            <Link
              href="/admin/destinations"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 