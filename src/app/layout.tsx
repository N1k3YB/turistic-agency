import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import Header from "@/components/Header";
import Link from "next/link";
import { MapPinIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { Toaster } from "react-hot-toast";
import FooterPopularDestinations from "@/components/FooterPopularDestinations";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Турагентство 'АВИАВЭЙС'",
  description: "Лучшие туры по всему миру",
  icons: {
    icon: "/airplane-flight.svg",
    shortcut: "/airplane-flight.svg",
    apple: "/airplane-flight.svg"
  }
};

// Компонент футера
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">О компании</h3>
            <p className="text-gray-300 mb-4">Турагентство "АВИАВЭЙС" предлагает незабываемые путешествия по всему миру с 2010 года. Мы стремимся сделать ваш отдых комфортным и запоминающимся.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Разделы сайта</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Главная</Link></li>
              <li><Link href="/destinations" className="text-gray-300 hover:text-white transition-colors">Направления</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">О нас</Link></li>
              <li><Link href="/contacts" className="text-gray-300 hover:text-white transition-colors">Контакты</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Популярные направления</h3>
            <FooterPopularDestinations />
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">ул. Туристическая, 42, г. Москва, 123456</span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-blue-400 mr-2" />
                <a href="tel:+7952812" className="text-gray-300 hover:text-white transition-colors">+7 (495) 123-45-67</a>
              </li>
              <li className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-blue-400 mr-2" />
                <a href="mailto:info@aviaways.ru" className="text-gray-300 hover:text-white transition-colors">info@aviaways.ru</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Турагентство "АВИАВЭЙС". Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <SessionProvider>
          <Toaster position="top-center" />
          <Header />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
