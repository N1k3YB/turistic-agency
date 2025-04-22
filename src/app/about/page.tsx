import Image from 'next/image';
import { MapPinIcon, ClockIcon, UsersIcon, GlobeAltIcon, TrophyIcon, HeartIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'О нас | Турагентство "АВИАВЭЙС"',
  description: 'Узнайте больше о турагентстве "АВИАВЭЙС" - ваш надежный партнер для незабываемых путешествий с 2010 года',
};

export default function AboutPage() {
  return (
    <main className="bg-gray-50">
      {/* Главный заголовок с фоном */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-blue-600 opacity-90 z-10"></div>
        <div className="absolute inset-0 bg-[url('/about-hero.jpg')] bg-cover bg-center"></div>
        <div className="relative container mx-auto px-4 text-center z-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">О компании "АВИАВЭЙС"</h1>
          <p className="text-xl text-white max-w-2xl mx-auto">Ваш надежный партнер для незабываемых путешествий с 2010 года</p>
        </div>
      </section>

      {/* О компании */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Наша история</h2>
              <p className="text-gray-600 mb-6">
                Турагентство "АВИАВЭЙС" было основано в 2010 году группой энтузиастов, объединенных общей страстью к путешествиям и стремлением сделать мир доступнее для каждого.
              </p>
              <p className="text-gray-600 mb-6">
                За более чем десятилетие работы мы выросли из небольшого офиса с тремя сотрудниками в одну из ведущих туристических компаний России, имеющую представительства в 12 городах страны и обслуживающую более 50 000 клиентов ежегодно.
              </p>
              <p className="text-gray-600">
                Наша миссия неизменна: открывать мир возможностей для наших клиентов, создавая идеальные путешествия, которые остаются в памяти на всю жизнь. Мы не просто продаем туры — мы помогаем воплощать мечты.
              </p>
            </div>
            <div className="relative">
              <div className="bg-white p-2 shadow-lg rotate-3 inline-block">
                <img
                  src="/images/about-office.jpeg"
                  alt="Офис компании АВИАВЭЙС"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-4 shadow-md rotate-[-3deg]">
                <p className="font-bold">Основано в 2010 году</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Наши преимущества */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Почему выбирают нас</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <TrophyIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Опыт и профессионализм</h3>
              <p className="text-gray-600">
                Более 13 лет в туристической индустрии и команда сертифицированных экспертов по туризму обеспечивают высочайшее качество обслуживания.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <GlobeAltIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Широкая география</h3>
              <p className="text-gray-600">
                Сотрудничество с более чем 150 туроператорами позволяет нам предлагать туры в более чем 80 стран мира на всех континентах.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <HeartIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Индивидуальный подход</h3>
              <p className="text-gray-600">
                Мы формируем предложения с учетом ваших предпочтений, бюджета и времени, чтобы каждое путешествие было идеальным.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Цифры и факты */}
      <section className="py-16 bg-gradient-to-r from-sky-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">АВИАВЭЙС в цифрах</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">13+</div>
              <p className="text-xl">лет на рынке</p>
            </div>
            
            <div>
              <div className="text-5xl font-bold mb-2">50 000+</div>
              <p className="text-xl">довольных клиентов</p>
            </div>
            
            <div>
              <div className="text-5xl font-bold mb-2">80+</div>
              <p className="text-xl">стран мира</p>
            </div>
            
            <div>
              <div className="text-5xl font-bold mb-2">12</div>
              <p className="text-xl">офисов в России</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Готовы отправиться в путешествие?</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Наши менеджеры готовы помочь вам спланировать идеальное путешествие, отвечающее всем вашим требованиям и предпочтениям.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/destinations" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Подобрать тур
            </a>
            <a 
              href="/contacts" 
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full transition-colors"
            >
              Связаться с нами
            </a>
          </div>
        </div>
      </section>
    </main>
  );
} 