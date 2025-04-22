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
              
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Мы в социальных сетях</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-200 hover:bg-blue-500 hover:text-white transition-colors rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 hover:bg-pink-500 hover:text-white transition-colors rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 hover:bg-sky-500 hover:text-white transition-colors rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 hover:bg-red-500 hover:text-white transition-colors rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
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