import { MapPinIcon, EnvelopeIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Контакты | Турагентство "АВИАВЭЙС"',
  description: 'Свяжитесь с нами, чтобы узнать больше о наших турах или получить консультацию от наших специалистов',
};

export default function ContactsPage() {
  return (
    <main className="bg-gray-50">
      {/* Главный заголовок с фоном */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-blue-600 opacity-90 z-10"></div>
        <div className="absolute inset-0 bg-[url('/contacts-hero.jpg')] bg-cover bg-center"></div>
        <div className="relative container mx-auto px-4 text-center z-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Свяжитесь с нами</h1>
          <p className="text-xl text-white max-w-2xl mx-auto">Мы всегда рады ответить на ваши вопросы и помочь с организацией путешествия</p>
        </div>
      </section>

      {/* Контактная информация и форма */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Контактная информация */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Контактная информация</h2>
              <p className="text-gray-600 mb-8">
                Вы можете связаться с нами любым удобным способом — по телефону, электронной почте или лично посетив наш офис. Мы всегда рады ответить на ваши вопросы!
              </p>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Адрес</h3>
                    <p className="text-gray-600">
                      ул. Туристическая, 42, г. Москва, 123456<br />
                      <span className="text-sm text-gray-500">
                        (Центральный офис, 5 минут от м. Туристическая)
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <PhoneIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Телефон</h3>
                    <p className="text-gray-600">
                      <a href="tel:+74951234567" className="hover:text-blue-600 transition-colors">+7 (495) 123-45-67</a> (общий)<br />
                      <a href="tel:+74951234568" className="hover:text-blue-600 transition-colors">+7 (495) 123-45-68</a> (отдел бронирования)
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Email</h3>
                    <p className="text-gray-600">
                      <a href="mailto:info@aviaways.ru" className="hover:text-blue-600 transition-colors">info@aviaways.ru</a> (общий)<br />
                      <a href="mailto:booking@aviaways.ru" className="hover:text-blue-600 transition-colors">booking@aviaways.ru</a> (отдел бронирования)
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Режим работы</h3>
                    <p className="text-gray-600">
                      Пн–Пт: 9:00 – 20:00<br />
                      Сб: 10:00 – 18:00<br />
                      Вс: выходной
                    </p>
                  </div>
                </div>
              </div>
              
              
            </div>
            
            {/* Форма обратной связи */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Связаться с нами</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ваш email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Тема *</label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled selected>Выберите тему обращения</option>
                    <option value="tour-info">Информация о турах</option>
                    <option value="booking">Бронирование</option>
                    <option value="complaint">Жалоба/Претензия</option>
                    <option value="partnership">Сотрудничество</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Сообщение *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ваше сообщение..."
                  ></textarea>
                </div>
                
                <div className="flex items-start">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-600">
                    Я согласен на обработку моих персональных данных в соответствии с политикой конфиденциальности *
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Отправить сообщение
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Карта */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Наше расположение</h2>
          <div className="bg-white p-2 shadow-lg rounded-lg">
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d84728.55144968401!2d63.26465579345249!3d45.61676233935709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x41f44767e36f0db1%3A0x7504084e7a5dc83b!2z0JHQsNC50LrQvtC90YPRgCwg0JrQsNC30LDRhdGB0YLQsNC9!5e0!3m2!1sru!2sru!4v1710248976099!5m2!1sru!2sru" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Филиалы */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Наши филиалы</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Турагентство "АВИАВЭЙС" представлено в 12 городах России. Найдите ближайший к вам офис!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Санкт-Петербург</h3>
              <address className="text-gray-600 not-italic mb-4">
                Невский проспект, 28<br />
                Тел: +7 (812) 123-45-67<br />
                Email: spb@aviaways.ru
              </address>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Подробнее →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Казань</h3>
              <address className="text-gray-600 not-italic mb-4">
                ул. Баумана, 15<br />
                Тел: +7 (843) 123-45-67<br />
                Email: kazan@aviaways.ru
              </address>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Подробнее →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Екатеринбург</h3>
              <address className="text-gray-600 not-italic mb-4">
                ул. Ленина, 40<br />
                Тел: +7 (343) 123-45-67<br />
                Email: ekb@aviaways.ru
              </address>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Подробнее →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Новосибирск</h3>
              <address className="text-gray-600 not-italic mb-4">
                пр. Красный, 29<br />
                Тел: +7 (383) 123-45-67<br />
                Email: nsk@aviaways.ru
              </address>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Подробнее →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Сочи</h3>
              <address className="text-gray-600 not-italic mb-4">
                ул. Курортный проспект, 50<br />
                Тел: +7 (862) 123-45-67<br />
                Email: sochi@aviaways.ru
              </address>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Подробнее →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Владивосток</h3>
              <address className="text-gray-600 not-italic mb-4">
                ул. Светланская, 83<br />
                Тел: +7 (423) 123-45-67<br />
                Email: vld@aviaways.ru
              </address>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Подробнее →</a>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-bold">
              Показать все офисы
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Часто задаваемые вопросы</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Не нашли ответ на свой вопрос? Свяжитесь с нами любым удобным способом!
          </p>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Как забронировать тур?</h3>
              <p className="text-gray-600">
                Забронировать тур можно несколькими способами: онлайн на нашем сайте, по телефону или лично посетив один из наших офисов. При бронировании необходимо внести предоплату в размере от 20% стоимости тура.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Какие документы нужны для оформления тура?</h3>
              <p className="text-gray-600">
                Для оформления тура необходим паспорт. Для зарубежных туров требуется загранпаспорт (срок действия не менее 6 месяцев с момента окончания поездки), а также, в зависимости от страны назначения, может потребоваться виза.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Как осуществляется оплата тура?</h3>
              <p className="text-gray-600">
                Оплатить тур можно наличными в офисе, банковской картой или банковским переводом. Мы также предлагаем возможность оплаты в рассрочку или кредит через наших банков-партнеров.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Можно ли отменить или изменить бронирование?</h3>
              <p className="text-gray-600">
                Условия отмены или изменения бронирования зависят от конкретного тура и сроков до начала поездки. В большинстве случаев при отмене тура взимается штраф, размер которого увеличивается по мере приближения к дате начала тура.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-sky-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Готовы к новым путешествиям?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Свяжитесь с нами сегодня и начните планировать свое идеальное путешествие с лучшими специалистами!
          </p>
          <a 
            href="tel:+74951234567" 
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors"
          >
            +7 (495) 123-45-67
          </a>
        </div>
      </section>
    </main>
  );
} 