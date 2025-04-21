import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { StarIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface User {
  name: string | null;
  image: string | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
  user: User;
}

interface ReviewListProps {
  tourId: number;
  refreshTrigger?: number;
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

export default function ReviewList({ tourId, refreshTrigger = 0 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [userReviewPending, setUserReviewPending] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      setUserReviewPending(false);
      
      try {
        // Получаем одобренные отзывы
        const response = await fetch(`/api/reviews?tourId=${tourId}`);
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить отзывы');
        }
        
        const data = await response.json();
        setReviews(data);

        // Если пользователь авторизован, проверяем есть ли у него ожидающий отзыв
        if (session?.user?.id) {
          const pendingResponse = await fetch(`/api/reviews/pending?tourId=${tourId}`);
          if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            if (pendingData.hasPendingReview) {
              setUserReviewPending(true);
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Ошибка при загрузке отзывов:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [tourId, refreshTrigger, session]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
        {[1, 2, 3].map((_, idx) => (
          <div key={idx} className="mb-8">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg mb-8">
        Не удалось загрузить отзывы: {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Отзывы</h3>
        <p className="text-gray-600">У этого тура пока нет отзывов. Будьте первым, кто оставит свой отзыв!</p>
      </div>
    );
  }

  // Функция для расчета среднего рейтинга
  const averageRating = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  ).toFixed(1);

  // Функция для сортировки отзывов - отзыв пользователя должен быть первым
  const sortedReviews = [...reviews].sort((a, b) => {
    if (session?.user?.id) {
      if (a.userId === session.user.id) return -1;
      if (b.userId === session.user.id) return 1;
    }
    // Если не отзыв пользователя, сортируем по дате (более новые - сверху)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Отображаем сообщение о том, что отзыв отправлен на модерацию
  if (userReviewPending) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Отзывы</h3>
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6">
          Ваш отзыв успешно отправлен и будет опубликован после проверки модератором.
        </div>
        {reviews.length > 0 && (
          <div className="space-y-8">
            {sortedReviews.map((review) => (
              <div 
                key={review.id} 
                className={`border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 ${
                  session?.user?.id === review.userId ? 'bg-blue-50 p-4 rounded-lg border border-blue-100' : ''
                }`}
              >
                <div className="flex items-center mb-3">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name || 'Пользователь'}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
                  )}
                  <div>
                    <div className="font-medium text-gray-800">
                      {review.userId === session?.user?.id ? 'Вы' : review.user.name || 'Пользователь'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: ru })}
                    </div>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h3 className="text-lg font-medium text-gray-900">Отзывы ({reviews.length} {getReviewWord(reviews.length)})</h3>
        <div className="flex items-center mt-2 md:mt-0">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(parseFloat(averageRating))
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-gray-700 font-medium">{averageRating} из 5</span>
        </div>
      </div>

      <div className="space-y-8">
        {sortedReviews.map((review) => (
          <div 
            key={review.id} 
            className={`border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 ${
              session?.user?.id === review.userId ? 'bg-blue-50 p-4 rounded-lg border border-blue-100' : ''
            }`}
          >
            <div className="flex items-center mb-3">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || 'Пользователь'}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
              ) : (
                <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
              )}
              <div>
                <div className="font-medium text-gray-800">
                  {review.userId === session?.user?.id ? 'Вы' : review.user.name || 'Пользователь'}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: ru })}
                </div>
              </div>
            </div>
            
            <div className="flex mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 