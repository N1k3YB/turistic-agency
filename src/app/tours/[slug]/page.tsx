'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  MapPinIcon, 
  PhotoIcon, 
  ShoppingCartIcon,
  ClockIcon,
  UsersIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

// Обновленный интерфейс для тура, включая данные направления
interface Tour {
  id: number;
  title: string;
  slug: string;
  price: string;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  fullDescription: string;
  itinerary: string;
  inclusions: string;
  exclusions: string;
  imageUrls: string[];
  duration: number;
  groupSize: number;
  availableSeats: number; // Добавлено количество свободных мест
  nextTourDate: string | null;
  createdAt: string;
  updatedAt: string;
  destinationId: number;
  destination: {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
  };
  hasOrder: boolean;
  averageRating?: number; // Средний рейтинг
  reviewCount?: number;   // Количество отзывов
}

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params?.slug as string;
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'itinerary' | 'inclusions' | 'gallery' | 'reviews'>('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [checkingFavorite, setCheckingFavorite] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userPhone, setUserPhone] = useState('');

  // Получаем данные о туре и его отзывы
  useEffect(() => {
    if (!slug) return;

    const fetchTour = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tours/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Тур с таким адресом не найден.');
          }
          throw new Error('Не удалось загрузить данные тура');
        }
        const data = await response.json();
        setTour(data);
        
        // Получаем отзывы для расчета рейтинга
        const reviewsResponse = await fetch(`/api/reviews?tourId=${data.id}`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
          
          // Рассчитываем средний рейтинг
          if (reviewsData.length > 0) {
            const totalRating = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0);
            const averageRating = (totalRating / reviewsData.length).toFixed(1);
            setTour(prev => prev ? {...prev, averageRating: parseFloat(averageRating), reviewCount: reviewsData.length} : null);
          }
        }
        
        // Если пользователь авторизован, заполним email из профиля
        if (session?.user?.email) {
          setContactEmail(session.user.email);
        }
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при загрузке');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [slug, session]);

  // Проверяем, добавлен ли тур в избранное
  useEffect(() => {
    if (!session?.user || !tour) {
      setCheckingFavorite(false);
      return;
    }

    const checkIfFavorite = async () => {
      try {
        setCheckingFavorite(true);
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const favorites = await response.json();
          const isFavorite = favorites.some((fav: any) => fav.tourId === tour.id);
          setIsInFavorites(isFavorite);
        }
      } catch (error) {
        console.error("Ошибка при проверке избранного:", error);
      } finally {
        setCheckingFavorite(false);
      }
    };

    checkIfFavorite();
  }, [session, tour]);

  // Эффект для загрузки данных пользователя, если он авторизован
  useEffect(() => {
    if (session?.user) {
      // Устанавливаем email пользователя для формы заказа
      setContactEmail(session.user.email || '');
      
      // Загружаем номер телефона пользователя, если он есть
      fetchUserPhone();
    }
  }, [session]);
  
  // Функция для загрузки телефона пользователя
  const fetchUserPhone = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const data = await response.json();
        setUserPhone(data.phone || '');
        // Устанавливаем телефон пользователя в форму заказа, если он есть
        if (data.phone) {
          setContactPhone(data.phone);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
    }
  };

  // Функция для добавления/удаления из избранного
  const toggleFavorite = async () => {
    if (!session) {
      toast.error("Необходимо войти в систему");
      router.push('/auth/signin');
      return;
    }

    if (!tour) return;

    try {
      if (isInFavorites) {
        // Удаляем из избранного
        const response = await fetch(`/api/favorites?tourId=${tour.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsInFavorites(false);
          toast.success("Тур удален из избранного");
        } else {
          toast.error("Не удалось удалить из избранного");
        }
      } else {
        // Добавляем в избранное
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tourId: tour.id }),
        });
        
        if (response.ok) {
          setIsInFavorites(true);
          toast.success("Тур добавлен в избранное");
        } else {
          toast.error("Не удалось добавить в избранное");
        }
      }
    } catch (error) {
      console.error("Ошибка при изменении избранного:", error);
      toast.error("Произошла ошибка");
    }
  };

  // Функция для создания заказа
  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Необходимо войти в систему");
      router.push('/auth/signin');
      return;
    }

    if (!tour) return;

    // Проверяем данные формы
    if (!contactEmail) {
      toast.error("Укажите email для связи");
      return;
    }

    if (quantity < 1) {
      toast.error("Укажите корректное количество мест");
      return;
    }

    if (quantity > tour.availableSeats) {
      toast.error(`Недостаточно свободных мест. Доступно: ${tour.availableSeats}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId: tour.id,
          quantity,
          contactEmail,
          contactPhone,
        }),
      });
      
      if (response.ok) {
        toast.success("Заказ успешно создан");
        setShowOrderForm(false);
        // Обновляем данные о свободных местах
        setTour({
          ...tour,
          availableSeats: tour.availableSeats - quantity
        });
        // Сбрасываем форму
        setQuantity(1);
        // Перенаправляем на страницу профиля с заказами
        router.push('/profile/orders');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Не удалось создать заказ");
      }
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      toast.error("Произошла ошибка при создании заказа");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функция для отображения звезд рейтинга
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon 
            key={star} 
            className={`h-5 w-5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-white/40'}`} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ошибка</h1>
        <p className="text-gray-600">{error}</p>
        <Link 
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 p-6 rounded-xl inline-block mx-auto">
          <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Тур не найден</h2>
          <p className="text-gray-600">Запрашиваемый тур не существует или был удален</p>
          <Link href="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Фотогалерея-слайдер в верхней части */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-gray-900">
        <ImageWithFallback
          src={tour.imageUrls[activeImageIndex] || tour.imageUrl}
          alt={`${tour.title} - Фото ${activeImageIndex + 1}`}
          layout="fill"
          objectFit="cover"
          className="transition-opacity duration-300"
          fallbackSrc="/images/image-placeholder.svg"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {/* Миниатюры изображений */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {tour.imageUrls.slice(0, 5).map((url, index) => (
            <button 
              key={index} 
              className={`h-16 w-24 relative rounded-lg overflow-hidden border-2 ${index === activeImageIndex ? 'border-white' : 'border-transparent opacity-70'} transition-all hover:opacity-100`}
              onClick={() => setActiveImageIndex(index)}
            >
              <ImageWithFallback
                src={url}
                alt={`Миниатюра ${index + 1}`}
                layout="fill"
                objectFit="cover"
                fallbackSrc="/images/image-placeholder.svg"
              />
            </button>
          ))}
          {tour.imageUrls.length > 5 && (
            <button className="h-16 w-24 relative rounded-lg overflow-hidden bg-black/40 text-white flex items-center justify-center border-2 border-transparent hover:border-white/40">
              +{tour.imageUrls.length - 5}
            </button>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 p-6 md:p-10 z-10 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Link href={`/destinations/${tour.destination.slug}`} className="bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {tour.destination.name}
                </Link>
                <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {tour.duration} {tour.duration === 1 ? 'день' : (tour.duration >= 2 && tour.duration <= 4) ? 'дня' : 'дней'}
                </div>
                <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  до {tour.groupSize} чел.
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white text-shadow mb-2">{tour.title}</h1>
              
              {/* Рейтинг тура */}
              <div className="flex items-center text-yellow-300 mb-2">
                {tour.averageRating ? (
                  <>
                    {renderRatingStars(tour.averageRating)}
                    <span className="ml-2 text-white text-sm">
                      {tour.averageRating.toFixed(1)} ({tour.reviewCount} {getReviewWord(tour.reviewCount ?? 0)})
                    </span>
                  </>
                ) : (
                  <>
                    {renderRatingStars(0)}
                    <span className="ml-2 text-white text-sm">Нет отзывов</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 sticky top-16 z-30">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab('description')}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Описание тура
            </button>
            <button 
              onClick={() => setActiveTab('itinerary')}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm ${activeTab === 'itinerary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Маршрут
            </button>
            <button 
              onClick={() => setActiveTab('inclusions')}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm ${activeTab === 'inclusions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Услуги
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm ${activeTab === 'gallery' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Галерея
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Отзывы
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка: Содержимое вкладок */}
          <div className="lg:col-span-2 space-y-8">
            {/* Вкладки с контентом */}
            {activeTab === 'description' && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">О туре</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{tour.shortDescription}</p>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line break-words overflow-hidden">{tour.fullDescription}</div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                  <CalendarDaysIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Маршрут
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.itinerary}</div>
              </div>
            )}

            {activeTab === 'inclusions' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                    <CheckCircleIcon className="h-6 w-6 mr-2 text-green-600" />
                    Что включено
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.inclusions}</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                    <ExclamationCircleIcon className="h-6 w-6 mr-2 text-red-600" />
                    Что не включено
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.exclusions}</div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                  <PhotoIcon className="h-6 w-6 mr-2 text-purple-600" />
                  Галерея
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tour.imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-md group cursor-pointer">
                      <ImageWithFallback
                        src={url}
                        alt={`${tour.title} - Фото ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-300"
                        fallbackSrc="/images/image-placeholder.svg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <ReviewList tourId={tour.id} refreshTrigger={reviewSubmitted ? 1 : 0} />
                <ReviewForm 
                  tourId={tour.id} 
                  onSuccess={() => setReviewSubmitted(true)}
                />
              </div>
            )}
          </div>

          {/* Правая колонка: Цена, Заказ */}
          <aside className="lg:col-span-1 space-y-6">
            <div className=" top-28 bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">
                {tour.price} {tour.currency}
              </h2>
              <p className="text-gray-600 mb-4">Цена за одного человека</p>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Длительность:</span>
                  <span className="font-medium">{tour.duration} {tour.duration === 1 ? 'день' : (tour.duration >= 2 && tour.duration <= 4) ? 'дня' : 'дней'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Группа:</span>
                  <span className="font-medium">до {tour.groupSize} человек</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Ближайшая дата:</span>
                  <span className="font-medium">
                    {tour.nextTourDate 
                      ? new Date(tour.nextTourDate).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) 
                      : 'Уточняйте у менеджера'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Свободных мест:</span>
                  <span className="font-medium text-blue-600">{tour.availableSeats}</span>
                </div>
              </div>
              
              {!showOrderForm ? (
                <>
                  {tour.hasOrder ? (
                    <Link 
                      href="/profile/orders"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors mb-3"
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-2" />
                      Перейти к заказам
                    </Link>
                  ) : (
                    <button 
                      className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors mb-3 ${tour.availableSeats === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (!session) {
                          router.push('/auth/signin');
                          return;
                        }
                        tour.availableSeats > 0 && setShowOrderForm(true);
                      }}
                      disabled={tour.availableSeats === 0}
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-2" />
                      {tour.availableSeats > 0 ? 'Забронировать' : 'Нет мест'}
                    </button>
                  )}
                  
                  <button 
                    className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    onClick={toggleFavorite}
                    disabled={checkingFavorite}
                  >
                    {isInFavorites ? (
                      <>
                        <HeartIconSolid className="h-5 w-5 mr-2 text-red-500" />
                        В избранном
                      </>
                    ) : (
                      <>
                        <HeartIcon className="h-5 w-5 mr-2" />
                        Добавить в избранное
                      </>
                    )}
                  </button>
                </>
              ) : (
                <form onSubmit={createOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Количество мест</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={tour.availableSeats}
                      value={quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Максимум {tour.availableSeats}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email для связи</label>
                    <input 
                      type="email" 
                      value={contactEmail} 
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон {userPhone ? '' : '(опционально)'}</label>
                    <input 
                      type="tel" 
                      value={contactPhone} 
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      placeholder={userPhone ? "Используется номер из профиля" : "Опционально"}
                    />
                    {userPhone && contactPhone !== userPhone && (
                      <button 
                        type="button"
                        onClick={() => setContactPhone(userPhone)}
                        className="mt-1 text-sm text-blue-600 hover:underline"
                      >
                        Использовать номер из профиля
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between font-medium text-lg pt-2 border-t border-gray-200">
                    <span>Итого:</span>
                    <span className="text-blue-600">{(parseFloat(tour.price) * quantity).toFixed(2)} {tour.currency}</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      {isSubmitting ? 'Обработка...' : 'Забронировать'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-medium text-gray-800 mb-3">Нужна помощь с выбором?</h3>
              <p className="text-gray-600 text-sm mb-4">Наши эксперты готовы помочь вам с подбором тура и ответить на все вопросы.</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Связаться с нами
              </button>
            </div>
          </aside>
        </div>
        
        {/* Секция похожих туров */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Похожие туры</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Здесь могут быть компоненты TourCard для похожих туров */}
            <div className="bg-white rounded-lg shadow-md p-3 text-center flex items-center justify-center h-48">
              <p className="text-gray-500">Скоро здесь появятся похожие туры</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Функция для правильного склонения слова "отзыв"
function getReviewWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'отзыв';
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return 'отзыва';
  } else {
    return 'отзывов';
  }
} 