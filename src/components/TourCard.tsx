import Link from 'next/link';
import { MapPinIcon, CalendarIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ImageWithFallback from '@/components/ImageWithFallback';

interface TourCardProps {
  tour: {
    id: number;
    title: string;
    slug: string;
    price: string; // Цена приходит как строка из API
    currency: string;
    imageUrl: string;
    shortDescription: string;
    duration?: number; // Добавляем duration как опциональное поле
    destination?: {
      name: string;
    };
    availableSeats?: number; // Добавляем количество свободных мест
    _count?: {
      reviews?: number; // Количество отзывов
    };
    averageRating?: number; // Средний рейтинг
  };
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  // Функция для получения правильного склонения дней
  const getDurationText = (duration: number = 7) => {
    if (duration === 1) return '1 день';
    if (duration >= 2 && duration <= 4) return `${duration} дня`;
    return `${duration} дней`;
  };

  // Функция для отображения символа валюты
  const getCurrencySymbol = (currency: string) => {
    switch(currency.toLowerCase()) {
      case 'rub':
      case 'руб':
        return '₽/чел';
      case 'eur':
      case 'евро':
        return '€/чел';
      case 'usd':
      case 'доллар':
        return '$/чел';
      default:
        return currency; // Если валюта неизвестна, отображаем ее код
    }
  };
  
  // Функция для склонения "место" в зависимости от числа
  const getSeatsText = (seats: number) => {
    if (seats === 1) return '1 место';
    if (seats >= 2 && seats <= 4) return `${seats} места`;
    return `${seats} мест`;
  };

  // Функция для склонения "отзыв" в зависимости от числа
  const getReviewsText = (count: number) => {
    if (count === 1) return '1 отзыв';
    if (count >= 2 && count <= 4) return `${count} отзыва`;
    return `${count} отзывов`;
  };

  // Рендер рейтинга в виде звезд
  const renderRating = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Округляем до ближайшей половины

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" />);
      }
    }
    return stars;
  };

  const noSeatsAvailable = tour.availableSeats !== undefined && tour.availableSeats <= 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out card-hover-effect h-full flex flex-col">
      <Link href={`/tours/${tour.slug}`} className="block h-full flex flex-col hover-scale">
        <div className="relative h-56 w-full">
          <ImageWithFallback
            src={tour.imageUrl}
            alt={tour.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out"
            fallbackSrc="/images/image-placeholder.svg"
          />

          {tour.destination && (
            <div className="absolute bottom-0 left-0 m-3">
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                <MapPinIcon className="h-4 w-4 text-blue-600 mr-1 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800 truncate">{tour.destination.name}</span>
              </div>
            </div>
          )}
          
          {/* Добавляем "Билетов нет" если нет свободных мест */}
          {noSeatsAvailable && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-5 right-1 bg-red-600 text-white py-1 px-7 transform rotate-45 translate-x-1/4 translate-y-1/4 font-bold shadow-lg text-sm">
                Билетов нет
              </div>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-2 text-sm">
            <div className="flex items-center text-blue-600">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{getDurationText(tour.duration)}</span>
            </div>
            
            {/* Показываем свободные места */}
            {tour.availableSeats !== undefined && (
              <div className="flex items-center text-gray-600">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                <span>{getSeatsText(tour.availableSeats)}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{tour.title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{tour.shortDescription}</p>
          
          {/* Рейтинг и количество отзывов */}
          {tour._count?.reviews !== undefined && (
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {renderRating(tour.averageRating || 0)}
              </div>
              <span className="text-sm text-gray-600">
                {getReviewsText(tour._count.reviews)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center text-blue-600 font-bold">
              <span>{tour.price} {getCurrencySymbol(tour.currency)}</span>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Подробнее
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TourCard; 