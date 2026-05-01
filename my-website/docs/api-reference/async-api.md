---
title: Асинхронное взаимодействие
sidebar_position: 2
description: Интеграции через брокер сообщений RabbitMQ (Уведомления и NLP-модуль)
---

В данном разделе описана архитектура асинхронного взаимодействия микросервисов системы с использованием брокера сообщений **RabbitMQ**. Выбор асинхронной модели обусловлен необходимостью изолировать основной бизнес-процесс (сохранение расписания) от длительных или потенциально нестабильных задач.

## Выбор брокера (RabbitMQ)

Решение использовать RabbitMQ основано на следующих факторах:
*   **Кроссплатформенность:** Работает на любых ОС (Linux, Windows, macOS) и легко разворачивается в облачной среде (AWS, GCP, Yandex Cloud).
*   **Языковая независимость:** Поддерживает все популярные языки программирования. Основной API может быть на Java/Kotlin или Python, а ML-воркер — на Python.
*   **Разделение нагрузки:** Тяжелые ML-воркеры с нейросетями могут быть развернуты на выделенных GPU-серверах, а основной сервис — на обычных серверах.

---

## Интеграция 1: Уведомления через соцсети

При изменении расписания система отправляет уведомления в мессенджеры, выбранные пользователями при подписке.

### Архитектура процесса
*   **Тип взаимодействия:** Асинхронно.
*   **Поток (Flow):** Основной сервис публикует событие в очередь RabbitMQ. Отдельный сервис забирает событие, определяет получателей по БД и отправляет уведомления через API Telegram/ВК. Пользователь не ждёт окончания отправки.

### Паттерны отказоустойчивости
*   **Сбой сервиса уведомлений:** Задача остаётся в очереди и обработается после перезапуска.
*   **Сбой API мессенджера:** Делается 5 повторных попыток с растущей задержкой, затем задача уходит в очередь для ручного разбора.
*   **Идемпотентность:** Обеспечивается через уникальный `event_id`.

### AsyncAPI Спецификация (Уведомления)

```yaml
asyncapi: 3.1.0
info:
  title: University Scheduler - Notification Integration
  version: 1.0.0
channels:
  schedule/events:
    address: schedule/events
    messages:
      publish.message:
        $ref: '#/components/messages/ScheduleChangeEvent'
operations:
  schedule/events.publish:
    action: receive
    channel:
      $ref: '#/channels/schedule~1events'
    messages:
      - $ref: '#/channels/schedule~1events/messages/publish.message'
components:
  messages:
    ScheduleChangeEvent:
      payload:
        type: object
        required: [eventId, eventType, affectedLesson]
        properties:
          eventId: { type: string, format: uuid }
          eventType: { type: string, enum: [TEACHER_CHANGED, ROOM_CHANGED, TIME_CHANGED, LESSON_CANCELLED] }
          occurredAt: { type: string, format: date-time }
          affectedLesson:
            type: object
            properties:
              lessonId: { type: string }
              subjectName: { type: string }
              date: { type: string, format: date }
```
---

## Интеграция 2: Модуль ИИ (NLP)

Пользователь вводит пожелания в свободной форме, которые ИИ-модуль превращает в структурированные ограничения для алгоритма.

### Архитектура процесса
*   **Тип взаимодействия:** Асинхронно.
*   **Поток (Flow):** API публикует задачу в очередь, ML-воркер забирает её, прогоняет через модель и возвращает результат. Пользователь получает уведомление о завершении обработки.

### Паттерны отказоустойчивости
*   **Сбой ML-воркера:** Задача подхватывается другим воркером из очереди.
*   **Низкая точность:** Если уверенность модели низкая, система просит пользователя уточнить запрос.
*   **Идемпотентность:** Обеспечивается через хеш текста — один и тот же запрос не обрабатывается дважды.

### AsyncAPI Спецификация (NLP-модуль)

```yaml
asyncapi: 3.1.0
id: [https://api.unischedule.edu/asyncapi/nlp.yaml](https://api.unischedule.edu/asyncapi/nlp.yaml)
info:
  title: University Scheduler - NLP Integration
  version: 1.0.0
channels:
  nlp/parse/request:
    address: nlp/parse/request
    messages:
      request.message: { $ref: '#/components/messages/NLPParseRequest' }
  nlp/parse/response:
    address: nlp/parse/response
    messages:
      response.message: { $ref: '#/components/messages/NLPParseResponse' }
components:
  messages:
    NLPParseRequest:
      payload:
        type: object
        required: [requestId, userId, text]
        properties:
          requestId: { type: string, format: uuid }
          text: { type: string, maxLength: 2000 }
    NLPParseResponse:
      payload:
        type: object
        required: [requestId, status]
        properties:
          requestId: { type: string, format: uuid }
          status: { type: string, enum: [SUCCESS, PARTIAL, FAILED] }
          confidence: { type: number, minimum: 0, maximum: 1 }
          extractedConstraints:
            type: array
            items:
              type: object
              properties:
                type: { type: string, enum: [WEEKDAY_RESTRICTION, TIME_RESTRICTION] }
```