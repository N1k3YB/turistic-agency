"use client";

import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { MapPinIcon, GlobeAltIcon, UserIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-sky-600 to-sky-400 w-10 h-10 rounded-full flex items-center justify-center border border-blue-600">
              <img src="/airplane-flight.svg" alt="Логотип" className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">АВИАВЭЙС</span>
              <span className="text-xs text-gray-500">Турагентство</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
              Туры
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/destinations" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
              Направления
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
              О нас
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/contacts" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
              Контакты
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-full"></div>
            ) : session ? (
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-medium transition-colors"
                  onClick={toggleUserMenu}
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{session.user.name || session.user.email}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Личный кабинет
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Панель администратора
                      </Link>
                    )}
                    {session.user.role === 'MANAGER' && (
                      <Link 
                        href="/manager" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Панель менеджера
                      </Link>
                    )}
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                <span>Войти</span>
              </Link>
            )}
            
            <button className="md:hidden text-gray-700" onClick={toggleMenu}>
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
        
        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Туры
              </Link>
              <Link href="/destinations" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Направления
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                О нас
              </Link>
              <Link href="/contacts" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Контакты
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 