# DESIGN

## Отмена запросов

Делаю через AbortController, а не через флаг "это ещё актуальный ответ".

почему: если просто игнорить старый ответ, запрос всё равно долетает по сети и зря грузит API. + в Network не видно canceled - а в задании как раз про реальную отмену.

В `src/country-search-controller.ts` на каждый `setQuery` сразу зову `abort()` у прошлого контроллера. Даже если debounce ещё не закончился. Иначе за время ожидания 300ms старый ответ может успеть прийти и нарисовать устаревшие страны.

AbortError пользователю не показываю - это нормальная отмена, не ошибка. TimeoutError и HttpError уже показываю, с Retry.

Таймаут склеиваю с пользовательским abort через `AbortSignal.any([controller.signal, AbortSignal.timeout(ms)])`.

## Debounce 300ms

Стоит 300ms в `src/main.ts`.

без debounce на каждую букву уйдёт запрос. Быстро словим гонки и лишнюю нагрузку на API.

Если поставить очень большой delay (например 1-2 сек), поиск будет тупить: пользователь уже дописал слово, а запрос ещё не ушёл.

300ms - норм компромисс: успевает дописать пару букв, но ответ приходит быстро.

## Big O

`mapCountryResponse` в `src/map-country-response.ts`:

- один проход по languages -> O(L)
- один проход по currencies -> O(C)
- borders просто копируются как есть

Итого примерно O(L + C). Для одной страны это почти константа, списки там короткие.

Кэш и дедуп в `src/search-countries-cached.ts`:

- get/set в Map по строке query -> в среднем O(1)
- inflight Map тоже O(1) на ключ
- abort одного вызывающего не роняет общий промис для остальных

История в `src/search-history.ts`:

- массив до 8 элементов в localStorage
- push/filter -> O(N), N маленький

## Чистый код

- Single Responsibility: поиск в `search-countries.ts`, кэш в `search-countries-cached.ts`, маппинг в `map-country-response.ts`, UI в `src/ui/`, оркестрация в `country-search-controller.ts`
- чистые функции без DOM/сети: `debounce`, `mapCountryResponse`, `classifySearchError` - их легко тестировать
- свои ошибки: `HttpError` в `http-error.ts`, чтобы отличать HTTP от abort/timeout
- без innerHTML: сборка DOM через `src/ui/dom.ts`
