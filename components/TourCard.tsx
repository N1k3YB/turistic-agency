import Link from 'next/link';
import { CurrencyDollarIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
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
    destination?: {
      name: string;
    };
  };
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out card-hover-effect">
      <Link href={`/tours/${tour.slug}`} className="block hover-scale">
        <div className="relative h-56 w-full">
          <ImageWithFallback
            src={tour.imageUrl}
            alt={tour.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out"
            fallbackSrc="/images/image-placeholder.svg"
          />
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-3 rounded-full text-sm font-medium">
            Популярный
          </div>
          {tour.destination && (
            <div className="absolute bottom-0 left-0 m-3">
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                <MapPinIcon className="h-4 w-4 text-blue-600 mr-1 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800 truncate">{tour.destination.name}</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center mb-2 text-sm text-blue-600">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>7 дней</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{tour.title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tour.shortDescription}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-blue-600 font-bold">
              <CurrencyDollarIcon className="h-5 w-5 mr-1" />
              <span>{tour.price} {tour.currency}</span>
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