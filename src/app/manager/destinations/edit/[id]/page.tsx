'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ImageWithFallback from '@/components/ImageWithFallback';

interface Destination {
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
  const router = useRouter();
  const { id } = params;
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: ''
  });
  const [originalData, setOriginalData] = useState<Destination | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Загрузка данных направления
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const response = await fetch(`/api/manager/destinations/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Направление не найдено');
          } else {
            throw new Error('Ошибка загрузки данных направления');
          }
        }
        
        const data = await response.json();
        
        if (data.destination) {
          setOriginalData(data.destination);
          setFormData({
            name: data.destination.name,
            slug: data.destination.slug,
            description: data.destination.description,
            imageUrl: data.destination.imageUrl
          });
        } else {
          throw new Error('Неверный формат данных с сервера');
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке направления:', error);
        setLoadError(error.message || 'Произошла ошибка при загрузке данных');
        toast.error(error.message || 'Произошла ошибка при загрузке данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Очищаем ошибку для поля при его изменении
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const generateSlug = () => {
    if (!formData.name) return;

    const slug = formData.name
      .toLowerCase()
      .replace(/[^\wа-яё\s-]/gi, '')  // Оставляем только буквы, цифры, пробелы и дефисы
      .replace(/\s+/g, '-')           // Заменяем пробелы на дефисы
      .replace(/-+/g, '-')            // Удаляем повторяющиеся дефисы
      .trim();                        // Убираем пробелы по краям

    setFormData(prev => ({ ...prev, slug }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Название обязательно';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Название должно содержать минимум 3 символа';
    }

    if (!formData.slug) {
      newErrors.slug = 'URL-идентификатор обязателен';
    } else if (!/^[a-z0-9а-яё-]+$/i.test(formData.slug)) {
      newErrors.slug = 'URL-идентификатор может содержать только буквы, цифры и дефисы';
    }

    if (!formData.description) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Описание должно содержать минимум 10 символов';
    }

    if (!formData.imageUrl) {
      newErrors.imageUrl = 'URL изображения обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/manager/destinations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении направления');
      }

      toast.success('Направление успешно обновлено');
      router.push('/manager/destinations');
    } catch (error: any) {
      console.error('Ошибка при обновлении направления:', error);
      toast.error(error.message || 'Произошла ошибка при обновлении направления');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/manager/destinations" className="text-blue-600 hover:text-blue-800 flex items-center mb-6">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Вернуться к списку направлений
          </Link>

          <div className="bg-red-50 rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto mb-4 bg-red-100 h-20 w-20 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ошибка загрузки</h2>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <button
              onClick={() => router.push('/manager/destinations')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться к списку направлений
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/manager/destinations" className="text-blue-600 hover:text-blue-800 flex items-center mb-6">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Вернуться к списку направлений
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Редактирование направления</h1>

        {originalData && originalData._count && originalData._count.tours > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-800">
            <p className="font-medium">Внимание!</p>
            <p>
              К этому направлению привязано {originalData._count.tours} {
                originalData._count.tours === 1 ? 'тур' : 
                originalData._count.tours < 5 ? 'тура' : 'туров'
              }. Изменения в названии или URL могут повлиять на существующие туры.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Информация о направлении</h2>
              <p className="text-gray-600">
                Отредактируйте информацию о направлении и нажмите "Сохранить изменения" для обновления данных.
              </p>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              {formData.imageUrl && (
                <ImageWithFallback
                  src={formData.imageUrl}
                  alt={formData.name || 'Изображение направления'}
                  layout="fill"
                  objectFit="cover"
                  fallbackSrc="/images/image-placeholder.svg"
                />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Название*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: Париж"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="slug" className="block text-gray-700 font-medium mb-2">
                URL-идентификатор*
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.slug ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="parizh"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Создать из названия
                </button>
              </div>
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Используется в URL адресе, например: /destinations/parizh
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Описание*
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                value={formData.description}
                onChange={handleChange}
                placeholder="Подробное описание направления..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="mb-8">
              <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
                URL изображения*
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.imageUrl ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Прямая ссылка на изображение в формате JPG, PNG или WebP
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/manager/destinations"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Отмена
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
    </div>
  );
} 