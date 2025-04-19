import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors">Турагентство "Полёт"</span>
        </Link>
        <div className="space-x-4">
          <Link href="/">
            <span className="text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">Туры</span>
          </Link>
          <Link href="/destinations">
            <span className="text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">Направления</span>
          </Link>
          {/* Можно добавить другие ссылки позже */}
        </div>
      </nav>
    </header>
  );
};

export default Header; 