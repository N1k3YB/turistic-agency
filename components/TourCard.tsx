import Image from 'next/image';
import Link from 'next/link';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface TourCardProps {
  tour: {
    id: number;
    title: string;
    slug: string;
    price: string; // Цена приходит как строка из API
    currency: string;
    imageUrl: string;
    shortDescription: string;
  };
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <Link href={`/tours/${tour.slug}`} className="block">
        <div className="relative h-48 w-full">
          <Image
            src={tour.imageUrl}
            alt={tour.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{tour.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tour.shortDescription}</p>
          <div className="flex items-center text-indigo-600">
            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
            <span className="font-medium">{tour.price} {tour.currency}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TourCard; 