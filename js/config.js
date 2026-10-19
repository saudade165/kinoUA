// Налаштування KinoUA. Заповнюйте лише реальними значеннями — порожнє значення вимикає функцію в інтерфейсі.
window.KUA_CONFIG={
  // Посилання на чат підтримки в Telegram, напр. "https://t.me/<ваш_канал_підтримки>". Поки порожнє — посилання показується як «скоро».
  supportTelegramUrl:"",
  // Вхід через Google: Supabase Auth. Лише ПУБЛІЧНІ значення (Project URL і publishable/anon key) — їх можна тримати в коді сайту.
  // НІКОЛИ не вставляйте сюди service_role / secret key чи Google Client Secret.
  // Де взяти: Supabase Dashboard → Project Settings → API Keys (Project URL і "Publishable key" або legacy "anon").
  supabase:{
    url:"https://xjkyudhahydookywtahh.supabase.co",               // Project URL (перевірено: проєкт приймає цей publishable key)
    publishableKey:"sb_publishable_4JWdqmcVXmO7WMLVZQeVtA_S5uRPNNB"  // публічний ключ; секретний ключ сюди не вставляти
  },
  // Інші способи входу (Telegram, email) вмикаються лише після появи серверної частини (див. README → «Автентифікація»).
  auth:{
    emailEndpoint:"",    // POST {email} → сервер надсилає лист із посиланням для входу
    telegramStartUrl:""  // серверний маршрут для Telegram Login (перевірка підпису лише на сервері)
  }
};

// Версія даних і скриптів (збільшуйте після змін, щоб браузери не брали старі файли з кешу)
window.KUA_VER="4.0";
