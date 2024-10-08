# Проектная работа спринта №1

## Задание №1

Я выполнил задание только на первые 2 уровня (без запуска самого приложения).
В даннм проекте я принял решение использовать Webpack Module Federation, так как мне кажется это наиболее простым и понятным решением, особенно учитывая то, что проект написан на одном фреймворке React, выполнение этой задачи на Single SPA потребовало бы большей реструктуризации проекта, так же тут мы можем шарить зависимости между нашими фронтендами.

### Разделение по микрофронтендам:
- host-app - основное приложение-хост проекта
- auth-app - микрофронтенд отвечающий за авторизацию, регистраицю, всплывающие окна авторизации и добавления в общий стейт данных о авторизации
- profile-app - микрофронтенд отвечающий за шапку страницы (профиль пользователя, редактирование профиля, добавление/редактирование аватарки, кнопка добавить пост)
- feed-app - микрофронтенд отвечающий за ленту выдачи карточке , за саму карточку, а так же за создание карточки

Мне показалось логичным сделать такое разделение, потому, что каждая часть логически отделена по смыслу от другой, и скорее всего они будут редкатироваться вместе и по одним причинам, а следовательно их удобно выделить в отдельные проекты, чтобы над ними могли работать отдельные команды

Auth-app, скорее всего, все что связано с регистрацией и авторизацией будет сильно взаимосвязанно и меняться при примерно одинаковым причинам, поэтому удобно выделить под это приложение, договорившись о форматах пользователя в стейте, которые приложения будут делить.

Profile-ap - это шапка сайта и как мне кажется, хотя и имеет немного разные функциональности (управление профилем и создание карточки), но стилистически и с точки зрения изменения дизайна будут меняться и поддерживаться в одно время, соответсвенно лучше, если это будет отдельная команда, а не две разные.

Feed-app, тут все более менее понятно, все что касается карточек, скорее всего будет менятся чаще всего, так как это основная часть нашего приложения, поэтому удобнее будет иметь такое приложение отдельно.


## Задание №2

Для разбиения на миросервисы и изменения структуры проекта, нам нужно будет отказаться от frontend на Django для администраторов и выделить его в отдельный проект
чтобы мы могли хорошо масштибаровать и делить систему на микросервисы.

Для упрощения организации системы мы принимаем паттерн простого API-Gateway в виде reverse-proxy на nginx, который будет принимать и маршрутизировать запросы.
Так же на нем можно организовать load-balance. Помимо этого в его задачи будет входить аутентификация запросов. При поступлении запроса на nginx, он идет
с ним в сервис авторизации, который навешивает на запрос нужные авторизационные метки и возвращает на nginx, который в свою очередь ведет запрос дальше в нужный
сервис. К преимуществам такого подхода можно отнести то, что все наши внутренние сервисы не будут выходить за наш внутренний периметр, что повышает простоту
слежения за безопасностью, у нас есть одна точка выхода во внешний мир, но это за собой тянет и проблему единой точки отказа, именно поэтому выбран простой и легкий
инструмент - nginx, который к тому же можно масштабировать.

Сервис авторизации и упраления пользователями отвечает за авторизацию, хранение и создание пользователей и управления ролями, при авторизации. Решено реализовывать
его на Go, так как он будет учавствовать в каждом запросе, поэтому хотелось бы достаточной производительности от него. В качестве СУБД можно использовать Postgres,
так как команда и так с ним знакома и в целом подходит под наши задачи.

Сервис профилей пользователей выделен в отдельный сервис для удобства масштибирования нагрузок на сервис авторизации, а так же по тому, что они отвечают за разные задачи,
поэтому лучше их развивать отдельно.

Сервисы товаров и услуг собой предоставляет реализацию отображения товаров и услуг, которые пользователь может создать в своем профиле. В данном случае у нас нет
слишком больших требований по производительности, поэтому можно остаться на Python, в котором есть уже экспертиза в команде, но Django в такой архитектуре теряет свои
преимущества, поэтому решено перейти на FastAPI. Сервисы разделены между собой, так как они могут развиваться в разном направлении независимо друг от друга.

Чтобы поиск у нас работал легко и удобно и по товарам и по услугам, мы выносим сам поиск в отдельный сервис поиска, где данные будут хранится в Elasticsearch, где мы
сможем их искать и доставать довольно быстро, чтобы данные туда попадали, мы будем публиковать в шину данных сообщения при создании/изменении услуг/товаров (по
паттерну Outbox), чтобы в сервисе поиска их обрабатывать и загружать в базу. Конечно тут могут быть некоторые задержки при создании объекта в сервисе и услугах и его
появлении в поиске, но мы можем этим пренебречь в угоду независимости сервисов.

Сервис аукциона мы выносим по принципу выделения общей бизнес логики, функциональности содержащиеся в нем будут изменяться вместе и по похожим причинам, поэтому
стоит их содержать вместе.Так как у нас тут нет особых требований к СУБД, то проще всего выбрать знакомую нам и команде.

Сервис поддержки отвечает за обработку заявок в службу поддержки.

Сервис платежей отвечает за взаимодействие с внешним сервисом платежей, тут так же сосредоточена логика отрабатывающая одну бизнес задачу.

Сервис нотификации служит единым шлюзом для отправки нотификаций пользователям, но он не содержит в себе логики того, как эти уведомления собираются (никакой бизнес
логики), он служит лишь технически удобным решением.

Сервис статистики выделен для удобства сбора статистики и хранения ее в одном месте..
