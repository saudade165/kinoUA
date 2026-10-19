-- Two Blender Foundation open movies (CC BY 3.0) with playable video: Sintel (2010) and Tears of Steel (2012).
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_add_open_movies").
-- Metadata: Wikidata Q925587 / Q1173161. Video: Wikimedia Commons VP9 WebM transcodes (File:Sintel_movie_4K.webm, File:Tears_of_Steel_1080p.webm).
-- Images in assets/ are from Wikimedia Commons (File:Sintel_poster.jpg, File:Sintel-screenshot-3.jpg, File:Tos-poster.png, File:Tears_of_Steel_frame_00_1c.jpg), CC BY 3.0 Blender Foundation.
-- Rollback: delete from public.content where slug in ('sintel-2010','tears-of-steel-2012');  (genres and sources cascade)

with c as (
  insert into public.content (slug, ty, title_orig, title_uk, title_ru, short, description, year, premiere_date, runtime_min, release_status, orig_lang, countries, audio_langs,
    imdb_id, tmdb_id, poster, backdrop, cast_list, crew, pub_status)
  values
  ('sintel-2010', 'cartoons', 'Sintel', 'Сінтел', 'Синтел',
   '{"uk":"Самотня мандрівниця Сінтел рятує дракончика, а коли його викрадає дорослий дракон, вирушає на небезпечні пошуки.","ru":"Одинокая странница Синтел спасает дракончика, а когда его похищает взрослый дракон, отправляется на опасные поиски.","en":"A lonely wanderer named Sintel rescues a baby dragon, and when an adult dragon snatches him away, she sets out on a perilous search."}',
   '{"uk":"Сінтел знаходить пораненого дракончика, виходжує його й називає Лускою. Коли дорослий дракон забирає малого, дівчина роками шукає його крізь сніги, пустелі й гори — і розплата за цю мандрівку виявляється неочікуваною.\n\nВідкритий фільм Blender Foundation (Durian Open Movie Project). Ліцензія CC BY 3.0. Відео: Wikimedia Commons.","ru":"Синтел находит раненого дракончика, выхаживает его и называет Чешуйкой. Когда взрослый дракон забирает малыша, девушка годами ищет его среди снегов, пустынь и гор — и цена этого путешествия оказывается неожиданной.\n\nОткрытый фильм Blender Foundation (Durian Open Movie Project). Лицензия CC BY 3.0. Видео: Wikimedia Commons.","en":"Sintel finds a wounded baby dragon, nurses him back to health and names him Scales. When an adult dragon carries him off, she spends years searching through snow, desert and mountains — and the price of the journey is not what she expects.\n\nAn open movie by the Blender Foundation (Durian Open Movie Project). Licensed under CC BY 3.0. Video: Wikimedia Commons."}',
   2010, '2010-09-27', 15, 'released', 'en', '{NL}', '{en}', 'tt1727587', 45745,
   'assets/posters/sintel-2010.jpg', 'assets/backdrops/sintel-2010.jpg',
   '[{"name":"Halina Reijn","ch":"Sintel"},{"name":"Thom Hoffman","ch":"Shaman"}]',
   '[{"name":"Colin Levy","job":"Director"},{"name":"Martin Lodewijk","job":"Writer"}]',
   'published'),
  ('tears-of-steel-2012', 'films', 'Tears of Steel', 'Сталеві сльози', 'Слёзы стали',
   '{"uk":"У майбутньому Амстердамі вчені й воїни намагаються врятувати світ від роботів, відтворивши одну давню сварку.","ru":"В будущем Амстердаме учёные и воины пытаются спасти мир от роботов, воссоздав одну давнюю ссору.","en":"In a future Amsterdam, scientists and soldiers try to save the world from robots by recreating one fateful argument from the past."}',
   '{"uk":"Світ захопили бойові роботи. Невелика група вчених і бійців у зруйнованому Амстердамі вірить, що все почалося з розставання двох людей багато років тому, — і намагається повернути той момент.\n\nВідкритий фільм Blender Foundation (Project Mango). Ліцензія CC BY 3.0. Відео: Wikimedia Commons.","ru":"Мир захватили боевые роботы. Небольшая группа учёных и бойцов в разрушенном Амстердаме верит, что всё началось с расставания двух людей много лет назад, — и пытается вернуть тот момент.\n\nОткрытый фильм Blender Foundation (Project Mango). Лицензия CC BY 3.0. Видео: Wikimedia Commons.","en":"Combat robots have overrun the world. In a ruined Amsterdam, a small group of scientists and fighters believes it all began with a breakup years ago — and tries to relive that moment.\n\nAn open movie by the Blender Foundation (Project Mango). Licensed under CC BY 3.0. Video: Wikimedia Commons."}',
   2012, null, 12, 'released', 'en', '{NL}', '{en}', 'tt2285752', 133701,
   'assets/posters/tears-of-steel-2012.jpg', 'assets/backdrops/tears-of-steel-2012.jpg',
   '[{"name":"Derek de Lint"}]',
   '[{"name":"Ian Hubert","job":"Director"}]',
   'published')
  returning id, slug
), g as (
  insert into public.content_genres (content_id, genre_slug, position)
  select c.id, x.g, x.p from c join (values ('sintel-2010','fantasy',0), ('sintel-2010','adventure',1), ('tears-of-steel-2012','scifi',0), ('tears-of-steel-2012','action',1)) x(s,g,p) on x.s = c.slug
  returning 1
)
insert into public.video_sources (content_id, provider, ref, label, lang, is_default, enabled, position)
select c.id, 'mp4', x.ref, x.label, 'en', x.def, true, x.pos from c join (values
  ('sintel-2010', 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f1/Sintel_movie_4K.webm/Sintel_movie_4K.webm.1080p.vp9.webm', '1080p', true, 0),
  ('sintel-2010', 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f1/Sintel_movie_4K.webm/Sintel_movie_4K.webm.480p.vp9.webm', '480p', false, 1),
  ('tears-of-steel-2012', 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cb/Tears_of_Steel_1080p.webm/Tears_of_Steel_1080p.webm.1080p.vp9.webm', '1080p', true, 0),
  ('tears-of-steel-2012', 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cb/Tears_of_Steel_1080p.webm/Tears_of_Steel_1080p.webm.480p.vp9.webm', '480p', false, 1)
) x(s, ref, label, def, pos) on x.s = c.slug;
