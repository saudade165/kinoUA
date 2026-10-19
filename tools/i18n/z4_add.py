# Версія 4: прибрано фільми Blender, фільтри мови оригіналу й рівня, IMDb, трейлери з обробкою помилок
APP_LN_ADD={
"es":["іспанська","испанский","Spanish"],"fr":["французька","французский","French"],"de":["німецька","немецкий","German"],
"it":["італійська","итальянский","Italian"],"ko":["корейська","корейский","Korean"],"ja":["японська","японский","Japanese"],
"hi":["гінді","хинди","Hindi"],"ta":["тамільська","тамильский","Tamil"],"zh":["китайська","китайский","Chinese"],
"pt":["португальська","португальский","Portuguese"],"pl":["польська","польский","Polish"],"tr":["турецька","турецкий","Turkish"],
"sv":["шведська","шведский","Swedish"],"da":["данська","датский","Danish"],"no":["норвезька","норвежский","Norwegian"],
"th":["тайська","тайский","Thai"],"cn":["кантонська","кантонский","Cantonese"],"te":["телугу","телугу","Telugu"]}

APP_ADD={
"no":["Недоступний","Недоступен","Not available"],
"na":["Фільм недоступний для перегляду на KinoUA. Показуємо опис, акторів, офіційний трейлер і посилання на TMDB та IMDb.","Фильм недоступен для просмотра на KinoUA. Показываем описание, актёров, официальный трейлер и ссылки на TMDB и IMDb.","This title can’t be watched on KinoUA. We show the overview, cast, official trailer and links to TMDB and IMDb."],
"nat":["Фільм недоступний для перегляду на KinoUA. Офіційного трейлера в наших даних немає.","Фильм недоступен для просмотра на KinoUA. Официального трейлера в наших данных нет.","This title can’t be watched on KinoUA. There’s no official trailer in our data."],
"subsUnk":["Мови субтитрів: невідомо","Языки субтитров: неизвестно","Subtitle languages: unknown"],
# фільтри
"fol":["Мова оригіналу","Язык оригинала","Original language"],
"folAll":["Будь-яка мова оригіналу","Любой язык оригинала","Any original language"],
"flv":["Рівень мови (CEFR)","Уровень языка (CEFR)","Language level (CEFR)"],
"flvAll":["Будь-який рівень","Любой уровень","Any level"],
"flvUnk":["Рівень не визначено","Уровень не определён","Level not determined"],
"flvNote":["Рівні — приблизна автоматична оцінка за транскриптом, а не сертифікат CEFR. Для більшості тайтлів транскрипту поки немає, тому рівень не визначено.","Уровни — приблизительная автоматическая оценка по транскрипту, а не сертификат CEFR. Для большинства тайтлов транскрипта пока нет, поэтому уровень не определён.","Levels are an approximate automatic estimate from a transcript, not a CEFR certificate. Most titles don’t have a transcript yet, so their level isn’t determined."],
"fpp":["Фільтри","Фильтры","Filters"],
"fresAll":["Скинути всі фільтри","Сбросить все фильтры","Reset all filters"],
"fy0":["Рік","Год","Year"],"fg0":["Жанр","Жанр","Genre"],"fq0":["Назва","Название","Title"],
# рівні
"lvlN":{"A1":["A1 — початковий","A1 — начальный","A1 — beginner"],"A2":["A2 — базовий","A2 — базовый","A2 — elementary"],"B1":["B1 — середній","B1 — средний","B1 — intermediate"],"B2":["B2 — вищий за середній","B2 — выше среднего","B2 — upper intermediate"],"C1":["C1 — просунутий","C1 — продвинутый","C1 — advanced"],"C2":["C2 — близький до носія","C2 — близкий к носителю","C2 — near-native"]},
"lvlH":["Мова й рівень","Язык и уровень","Language and level"],
"lvl":["Рівень мови","Уровень языка","Language level"],
"lvlApprox":["приблизна автоматична оцінка, не сертифікат CEFR","приблизительная автоматическая оценка, не сертификат CEFR","approximate automatic estimate, not a CEFR certificate"],
"lvlWhyUnk":["Щоб оцінити рівень, потрібен транскрипт (субтитри) фільму. Для цього тайтлу ми його не маємо, тож рівень не вказуємо, а не вгадуємо.","Чтобы оценить уровень, нужен транскрипт (субтитры) фильма. Для этого тайтла у нас его нет, поэтому уровень не указываем, а не угадываем.","Estimating the level needs the title’s transcript (subtitles). We don’t have one for this title, so we leave the level out instead of guessing."],
"olangN":["Оригінальна аудіодоріжка","Оригинальная аудиодорожка","Original audio"],
"olangSrc":["за даними TMDB (original_language)","по данным TMDB (original_language)","per TMDB (original_language)"],
# рейтинги
"ratU":["оцінка користувачів","оценка пользователей","user score"],
"votes":["голосів","голосов","votes"],
"imdbOpen":["Відкрити на IMDb","Открыть на IMDb","Open on IMDb"],
"imdbRev":["Відгуки й оцінки на IMDb","Отзывы и оценки на IMDb","Reviews and ratings on IMDb"],
"imdbNo":["Ідентифікатор IMDb невідомий","Идентификатор IMDb неизвестен","IMDb ID unknown"],
"ratSrc":["Оцінки: IMDb — з офіційного набору даних IMDb (19.10.2026), TMDB — знімок 18.10.2026. Це різні сервіси, оцінки не змішуються.","Оценки: IMDb — из официального набора данных IMDb (19.10.2026), TMDB — снимок 18.10.2026. Это разные сервисы, оценки не смешиваются.","Ratings: IMDb from the official IMDb dataset (19 Oct 2026), TMDB snapshot of 18 Oct 2026. They are separate services; scores are never mixed."],
"ids":["Зовнішні бази","Внешние базы","External databases"],
"sr":["Оцінкою IMDb","Оценкой IMDb","IMDb rating"],
"srt":["Оцінкою TMDB","Оценкой TMDB","TMDB rating"],
"trlNo":["Офіційного трейлера немає","Официального трейлера нет","No official trailer"],
}

PLAYER_ADD={
"trLoad":["Завантажуємо плеєр YouTube…","Загружаем плеер YouTube…","Loading the YouTube player…"],
"trErr":["Цей трейлер не можна відтворити на KinoUA: власник обмежив вбудовування або відео недоступне.","Этот трейлер нельзя воспроизвести на KinoUA: владелец ограничил встраивание или видео недоступно.","This trailer can’t be played on KinoUA: the owner restricted embedding or the video is unavailable."],
"trFile":["Вбудований плеєр YouTube не працює, коли сторінку відкрито як локальний файл (file://): браузер не передає адресу сайту, і YouTube показує помилку 153. Запустіть сайт через веб-сервер або перегляньте трейлер на YouTube.","Встроенный плеер YouTube не работает, когда страница открыта как локальный файл (file://): браузер не передаёт адрес сайта, и YouTube показывает ошибку 153. Запустите сайт через веб-сервер или посмотрите трейлер на YouTube.","The embedded YouTube player doesn’t work when the page is opened as a local file (file://): the browser sends no site address and YouTube shows error 153. Run the site from a web server or watch the trailer on YouTube."],
"trSlow":["Плеєр YouTube не відповідає. Можливо, його блокує мережа чи розширення браузера.","Плеер YouTube не отвечает. Возможно, его блокирует сеть или расширение браузера.","The YouTube player isn’t responding. A network or a browser extension may be blocking it."],
"trOpen":["Відкрити на YouTube","Открыть на YouTube","Open on YouTube"],
"trCode":["Код помилки YouTube","Код ошибки YouTube","YouTube error code"],
"trnote":["Офіційний трейлер з YouTube в оригінальній озвучці","Официальный трейлер с YouTube в оригинальной озвучке","Official YouTube trailer in the original language"],
}

NAV_ADD={
"rat2":["оцінка користувачів","оценка пользователей","user score"],
"olt":["Мова оригіналу","Язык оригинала","Original language"],
"lvt":["Приблизний рівень мови (CEFR), автоматична оцінка","Приблизительный уровень языка (CEFR), автоматическая оценка","Approximate language level (CEFR), automatic estimate"],
"ft":["Демо-версія. Фільми на KinoUA не транслюються: показуємо опис, акторів, офіційні трейлери й посилання на TMDB та IMDb. Плеєр із подвійними субтитрами працює на власній демо-сцені KinoUA.","Демо-версия. Фильмы на KinoUA не транслируются: показываем описание, актёров, официальные трейлеры и ссылки на TMDB и IMDb. Плеер с двойными субтитрами работает на собственной демо-сцене KinoUA.","Demo. Films aren’t streamed on KinoUA: we show details, cast, official trailers and links to TMDB and IMDb. The dual-subtitle player runs on KinoUA’s own demo scene."],
"imdbD":["Оцінки IMDb: офіційні набори даних IMDb (для некомерційного використання).","Оценки IMDb: официальные наборы данных IMDb (для некоммерческого использования).","IMDb ratings: official IMDb datasets (non-commercial use)."],
}

HOME_ADD={
"imdbOpen":["Відкрити на IMDb","Открыть на IMDb","Open on IMDb"],
"q5":["Чи можна дивитися фільми повністю?","Можно ли смотреть фильмы целиком?","Can I watch the films in full?"],
"a5":["Поки ні: у KinoUA немає ліцензованого джерела відео. Для кожного тайтлу ми показуємо опис, акторів, офіційний трейлер, оцінки й посилання на TMDB та IMDb. Плеєр із подвійними субтитрами можна випробувати на нашій демо-сцені.","Пока нет: у KinoUA нет лицензированного источника видео. Для каждого тайтла мы показываем описание, актёров, официальный трейлер, оценки и ссылки на TMDB и IMDb. Плеер с двойными субтитрами можно попробовать на нашей демо-сцене.","Not yet: KinoUA has no licensed video source. For every title we show the overview, cast, official trailer, ratings and links to TMDB and IMDb. You can try the dual-subtitle player on our demo scene."],
"heroPop":["у списку TMDB Popular","в списке TMDB Popular","on TMDB Popular"],
"trlOff":["Трейлер недоступний","Трейлер недоступен","No trailer"],
"lvlScene":["Рівень демо-сцени","Уровень демо-сцены","Demo scene level"],
"lvlSceneN":["приблизна автоматична оцінка англійського транскрипту, не сертифікат CEFR","приблизительная автоматическая оценка английского транскрипта, не сертификат CEFR","approximate automatic estimate of the English transcript, not a CEFR certificate"],
"swipe":["Гортайте вбік, щоб перемикати","Листайте в сторону для переключения","Swipe sideways to switch"],
}
