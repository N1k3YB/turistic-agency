'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Типы данных
interface Destination {
  id: number;
  name: string;
}

interface Tour {
  id: number;
  title: string;
  slug: string;
  price: string | number;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  fullDescription: string;
  inclusions: string;
  exclusions: string;
  itinerary: string;
  imageUrls: string[];
  destinationId: number;
  destination?: {
    name: string;
  };
  duration: number;
  groupSize: number;
  availableSeats: number;
  nextTourDate: string | null;
}

export default function EditTourPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const tourId = params?.id as string;
  
  // Состояния для формы
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('RUB');
  const [imageUrl, setImageUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [inclusions, setInclusions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [duration, setDuration] = useState('7');
  const [groupSize, setGroupSize] = useState('10');
  const [availableSeats, setAvailableSeats] = useState('10');
  const [nextTourDate, setNextTourDate] = useState('');
  
  // Состояния для дополнительных данных
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [tourLoading, setTourLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Refs для отслеживания загрузки данных
  const tourDataFetchedRef = useRef(false);
  const destinationsLoadedRef = useRef(false);
  
  // Загрузка списка направлений
  const fetchDestinations = useCallback(async () => {
    // Проверяем, были ли данные уже загружены
    if (destinationsLoadedRef.current) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/destinations');
      if (!response.ok) {
        throw new Error('Не удалось загрузить направления');
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data.destinations)) {
        setDestinations(data.destinations);
      } else if (data && Array.isArray(data)) {
        setDestinations(data);
      } else {
        console.error('Неожиданный формат данных:', data);
      }
      
      // Отмечаем, что данные были загружены
      destinationsLoadedRef.current = true;
    } catch (error) {
      console.error('Ошибка при загрузке направлений:', error);
      toast.error('Не удалось загрузить список направлений');
    }
  }, []);
  
  // Загрузка данных тура
  const fetchTourData = useCallback(async () => {
    // Проверяем, были ли данные уже загружены
    if (tourDataFetchedRef.current) {
      setTourLoading(false);
      return;
    }
    
    try {
      setTourLoading(true);
      const response = await fetch(`/api/manager/tours/${tourId}`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные тура');
      }
      
      const data = await response.json();
      
      if (data && data.tour) {
        const tour = data.tour as Tour;
        
        // Заполняем поля формы данными тура
        setTitle(tour.title);
        setSlug(tour.slug);
        setPrice(typeof tour.price === 'string' ? tour.price : tour.price.toString());
        setCurrency(tour.currency);
        setImageUrl(tour.imageUrl);
        setShortDescription(tour.shortDescription);
        setFullDescription(tour.fullDescription);
        setInclusions(tour.inclusions || '');
        setExclusions(tour.exclusions || '');
        setItinerary(tour.itinerary || '');
        setImageUrls(tour.imageUrls || []);
        setDestinationId(tour.destinationId.toString());
        setDuration(tour.duration.toString());
        setGroupSize(tour.groupSize.toString());
        setAvailableSeats(tour.availableSeats.toString());
        
        // Преобразуем дату в формат для input[type="date"]
        if (tour.nextTourDate) {
          const date = new Date(tour.nextTourDate);
          setNextTourDate(date.toISOString().split('T')[0]);
        }
      } else {
        toast.error('Структура данных тура не соответствует ожидаемой');
      }
      
      // Отмечаем, что данные были загружены
      tourDataFetchedRef.current = true;
    } catch (error) {
      console.error('Ошибка при загрузке данных тура:', error);
      toast.error('Не удалось загрузить данные тура');
      router.push('/manager/tours');
    } finally {
      setTourLoading(false);
    }
  }, [tourId, router]);
  
  // Проверка аутентификации и роли пользователя
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      const userRole = session?.user?.role;
      if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
        router.push('/');
        return;
      }
      
      // Загружаем список направлений и данные тура
      fetchDestinations();
      fetchTourData();
    }
  }, [status, session, router, fetchDestinations, fetchTourData]);
  
  // Сбрасываем флаги загрузки данных при смене пользователя или ID тура
  useEffect(() => {
    if (session?.user?.email || tourId) {
      tourDataFetchedRef.current = false;
      destinationsLoadedRef.current = false;
    }
  }, [session?.user?.email, tourId]);
  
  // Генерация slug из названия
  const generateSlug = useCallback(() => {
    const generatedSlug = title
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
  }, [title]);
  
  // Добавление URL изображения
  const addImageUrl = useCallback(() => {
    if (tempImageUrl && tempImageUrl.trim() !== '') {
      if (imageUrls.includes(tempImageUrl)) {
        toast.error('Это изображение уже добавлено');
        return;
      }
      
      setImageUrls([...imageUrls, tempImageUrl]);
      setTempImageUrl('');
    }
  }, [tempImageUrl, imageUrls]);
  
  // Удаление URL изображения
  const removeImageUrl = useCallback((urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  }, [imageUrls]);
  
  // Валидация формы
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Название тура обязательно';
    if (!slug.trim()) newErrors.slug = 'URL-идентификатор обязателен';
    if (!price.trim()) newErrors.price = 'Цена обязательна';
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) newErrors.price = 'Цена должна быть положительным числом';
    if (!currency.trim()) newErrors.currency = 'Валюта обязательна';
    if (!imageUrl.trim()) newErrors.imageUrl = 'URL основного изображения обязателен';
    if (!shortDescription.trim()) newErrors.shortDescription = 'Краткое описание обязательно';
    if (shortDescription.length > 250) newErrors.shortDescription = 'Краткое описание не должно превышать 250 символов';
    if (!fullDescription.trim()) newErrors.fullDescription = 'Полное описание обязательно';
    if (!destinationId) newErrors.destinationId = 'Необходимо выбрать направление';
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) newErrors.duration = 'Длительность должна быть положительным числом';
    if (isNaN(parseInt(groupSize)) || parseInt(groupSize) <= 0) newErrors.groupSize = 'Размер группы должен быть положительным числом';
    if (isNaN(parseInt(availableSeats)) || parseInt(availableSeats) <= 0) newErrors.availableSeats = 'Количество мест должно быть положительным числом';
    if (nextTourDate && isNaN(Date.parse(nextTourDate))) newErrors.nextTourDate = 'Некорректная дата';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, slug, price, currency, imageUrl, shortDescription, fullDescription, destinationId, duration, groupSize, availableSeats, nextTourDate]);
  
  // Отправка формы
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    try {
      setLoading(true);
      
      const tourData = {
        title,
        slug,
        price: parseFloat(price),
        currency,
        imageUrl,
        shortDescription,
        fullDescription,
        inclusions,
        exclusions,
        itinerary,
        imageUrls,
        destinationId: parseInt(destinationId),
        duration: parseInt(duration),
        groupSize: parseInt(groupSize),
        availableSeats: parseInt(availableSeats),
        nextTourDate: nextTourDate || null
      };
      
      const response = await fetch(`/api/manager/tours/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tourData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении тура');
      }
      
      toast.success('Тур успешно обновлен');
      router.push('/manager/tours');
    } catch (error: any) {
      console.error('Ошибка при обновлении тура:', error);
      toast.error(error.message || 'Произошла ошибка при обновлении тура');
    } finally {
      setLoading(false);
    }
  }, [
    title, slug, price, currency, imageUrl, shortDescription, fullDescription,
    inclusions, exclusions, itinerary, imageUrls, destinationId, duration, 
    groupSize, availableSeats, nextTourDate, tourId, router, validateForm
  ]);
  
  if (tourLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg">Загрузка данных тура...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/manager/tours" className="text-blue-600 hover:text-blue-800 flex items-center mb-6">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Вернуться к списку туров
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Редактирование тура</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          {/* Основная информация */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Основная информация</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Название тура */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Название тура *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={generateSlug}
                  className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Название тура"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              {/* URL-идентификатор */}
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
                    className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm"
                  >
                    Сгенерировать
                  </button>
                </div>
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Будет использоваться в URL: /tours/{slug || 'example-tour'}
                </p>
              </div>
              
              {/* Цена */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Цена *
                </label>
                <div className="flex">
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-l-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="10000"
                    step="0.01"
                    min="0"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="border border-l-0 border-gray-300 rounded-r-md px-3 py-2 bg-gray-50"
                  >
                    <option value="RUB">₽</option>
                    <option value="USD">$</option>
                    <option value="EUR">€</option>
                  </select>
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
              
              {/* Направление */}
              <div>
                <label htmlFor="destinationId" className="block text-sm font-medium text-gray-700 mb-1">
                  Направление *
                </label>
                <select
                  id="destinationId"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.destinationId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Выберите направление</option>
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
                {errors.destinationId && <p className="mt-1 text-sm text-red-600">{errors.destinationId}</p>}
              </div>
              
              {/* Длительность */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Длительность (дней) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                />
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              </div>
              
              {/* Размер группы */}
              <div>
                <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Размер группы (человек) *
                </label>
                <input
                  type="number"
                  id="groupSize"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.groupSize ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                />
                {errors.groupSize && <p className="mt-1 text-sm text-red-600">{errors.groupSize}</p>}
              </div>
              
              {/* Доступные места */}
              <div>
                <label htmlFor="availableSeats" className="block text-sm font-medium text-gray-700 mb-1">
                  Доступных мест *
                </label>
                <input
                  type="number"
                  id="availableSeats"
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.availableSeats ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                />
                {errors.availableSeats && <p className="mt-1 text-sm text-red-600">{errors.availableSeats}</p>}
              </div>
              
              {/* Дата следующего тура */}
              <div>
                <label htmlFor="nextTourDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Дата следующего тура
                </label>
                <input
                  type="date"
                  id="nextTourDate"
                  value={nextTourDate}
                  onChange={(e) => setNextTourDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.nextTourDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nextTourDate && <p className="mt-1 text-sm text-red-600">{errors.nextTourDate}</p>}
              </div>
            </div>
          </div>
          
          {/* Изображения */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Изображения</h2>
            
            {/* Основное изображение */}
            <div className="mb-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Основное изображение (URL) *
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
              {imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Предпросмотр:</p>
                  <img 
                    src={imageUrl} 
                    alt="Предпросмотр" 
                    className="h-40 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/image-placeholder.svg';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Дополнительные изображения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дополнительные изображения (опционально)
              </label>
              
              <div className="flex">
                <input
                  type="text"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
                >
                  Добавить
                </button>
              </div>
              
              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Дополнительное изображение ${index + 1}`} 
                        className="h-32 w-full object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/image-placeholder.svg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(url)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Описания */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Описания</h2>
            
            {/* Краткое описание */}
            <div className="mb-6">
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Краткое описание * <span className="text-gray-500">({shortDescription.length}/250)</span>
              </label>
              <textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Кратко опишите тур (до 250 символов)"
                rows={3}
              />
              {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>}
            </div>
            
            {/* Полное описание */}
            <div className="mb-6">
              <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Полное описание *
              </label>
              <textarea
                id="fullDescription"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.fullDescription ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Детальное описание тура"
                rows={6}
              />
              {errors.fullDescription && <p className="mt-1 text-sm text-red-600">{errors.fullDescription}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Что включено */}
              <div>
                <label htmlFor="inclusions" className="block text-sm font-medium text-gray-700 mb-1">
                  Что включено
                </label>
                <textarea
                  id="inclusions"
                  value={inclusions}
                  onChange={(e) => setInclusions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Перечислите, что включено в тур"
                  rows={5}
                />
              </div>
              
              {/* Что не включено */}
              <div>
                <label htmlFor="exclusions" className="block text-sm font-medium text-gray-700 mb-1">
                  Что не включено
                </label>
                <textarea
                  id="exclusions"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Перечислите, что не включено в тур"
                  rows={5}
                />
              </div>
              
              {/* Маршрут */}
              <div>
                <label htmlFor="itinerary" className="block text-sm font-medium text-gray-700 mb-1">
                  Маршрут/программа
                </label>
                <textarea
                  id="itinerary"
                  value={itinerary}
                  onChange={(e) => setItinerary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Опишите программу по дням"
                  rows={5}
                />
              </div>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/manager/tours"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 