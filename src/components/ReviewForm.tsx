import { useState, useEffect } from 'react';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';

interface ReviewFormProps {
  tourId: number;
  onSuccess?: () => void;
}

export default function ReviewForm({ tourId, onSuccess }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasReview, setHasReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли у пользователя отзыв, одобренный или неодобренный
    const checkUserReview = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/reviews/pending?tourId=${tourId}`);
        if (response.ok) {
          const data = await response.json();
          // Если у пользователя есть отзыв в любом статусе, не показываем форму
          setHasReview(data.hasPendingReview || data.hasApprovedReview);
        }
      } catch (error) {
        console.error('Ошибка при проверке отзывов пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserReview();
  }, [session, tourId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Пожалуйста, выберите оценку от 1 до 5');
      return;
    }
    
    if (comment.length < 10) {
      setError('Комментарий должен содержать минимум 10 символов');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId,
          rating,
          comment,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка при отправке отзыва');
      }
      
      setSuccess('Ваш отзыв успешно отправлен и будет опубликован после проверки модератором');
      setRating(0);
      setComment('');
      setHasReview(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Если пользователь не авторизован, показываем сообщение с призывом авторизоваться
  if (!session) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Оставить отзыв</h3>
        <p className="text-gray-600 mb-4">Чтобы оставить отзыв, необходимо <a href="/auth/signin" className="text-blue-600 hover:underline">войти в аккаунт</a>.</p>
      </div>
    );
  }

  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }
  
  // Если у пользователя уже есть отзыв (одобренный или неодобренный), скрываем форму
  if (hasReview) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Оставить отзыв</h3>
      
      {success ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
          {success}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ваша оценка</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-yellow-400 focus:outline-none"
                >
                  {star <= (hoverRating || rating) ? (
                    <StarSolid className="h-8 w-8" />
                  ) : (
                    <StarOutline className="h-8 w-8" />
                  )}
                </button>
              ))}
              <span className="ml-2 text-gray-600">
                {rating ? `${rating} из 5` : 'Выберите оценку'}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="comment" className="block text-gray-700 mb-2">
              Ваш комментарий
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Расскажите о вашем опыте..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              minLength={10}
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {comment.length}/1000 символов
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
          </button>
        </form>
      )}
    </div>
  );
} 