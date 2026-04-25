import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "Booking API",
})
@server("http://localhost:3000", "Local dev server")
@route("/api/v1")
namespace BookingAPI;

// ─────────────────────────────────────────────
//  Models
// ─────────────────────────────────────────────

@doc("Тип события — шаблон встречи, который создаёт владелец")
model EventType {
  @key
  id: string;

  @doc("Название типа события, например «Консультация»")
  name: string;

  @doc("Описание встречи")
  description: string;

  @doc("Длительность в минутах")
  @minValue(1)
  durationMinutes: int32;

  createdAt: utcDateTime;
}

model CreateEventTypeRequest {
  name: string;
  description: string;

  @minValue(1)
  durationMinutes: int32;
}

@doc("Бронирование — запись гостя на конкретный слот")
model Booking {
  @key
  id: string;

  @doc("ID типа события")
  eventTypeId: string;

  @doc("Название типа события (для удобства отображения)")
  eventTypeName: string;

  @doc("Начало бронирования")
  startAt: utcDateTime;

  @doc("Конец бронирования")
  endAt: utcDateTime;

  guestName: string;
  guestEmail: string;
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  eventTypeId: string;

  @doc("Начало слота в формате ISO 8601")
  startAt: utcDateTime;

  guestName: string;

  @format("email")
  guestEmail: string;
}

@doc("Свободный слот — вычисляется сервером, не хранится в БД")
model Slot {
  startAt: utcDateTime;
  endAt: utcDateTime;
}

@doc("Расписание рабочих часов на конкретный день недели")
model Availability {
  @key
  id: string;

  @doc("День недели: 0 = пн, 1 = вт, ..., 6 = вс")
  @minValue(0)
  @maxValue(6)
  dayOfWeek: int32;

  @doc("Начало рабочего дня, например 09:00")
  startTime: plainTime;

  @doc("Конец рабочего дня, например 17:00")
  endTime: plainTime;
}

model UpdateAvailabilityRequest {
  @minValue(0)
  @maxValue(6)
  dayOfWeek: int32;

  startTime: plainTime;
  endTime: plainTime;
}

// ─────────────────────────────────────────────
//  Errors
// ─────────────────────────────────────────────

@doc("Ошибка валидации")
@error
model ApiError {
  @statusCode statusCode: 400;
  message: string;
}

@doc("Слот уже занят другим бронированием")
@error
model ConflictError {
  @statusCode statusCode: 409;
  message: string;
}

@doc("Ресурс не найден")
@error
model NotFoundError {
  @statusCode statusCode: 404;
  message: string;
}

// ─────────────────────────────────────────────
//  Owner API — управление календарём
// ─────────────────────────────────────────────

@route("/owner")
@tag("Owner")
namespace Owner {

  @route("/event-types")
  namespace EventTypes {

    @doc("Получить все типы событий")
    op list(): EventType[];

    @doc("Создать новый тип события")
    op create(@body body: CreateEventTypeRequest): {
      @statusCode statusCode: 201;
      @body body: EventType;
    } | ApiError;
  }

  @route("/bookings")
  namespace Bookings {

    @doc("Все предстоящие бронирования, отсортированные по времени")
    op list(): Booking[];
  }

  @route("/availability")
  namespace Availability {

    @doc("Текущее расписание рабочих часов (массив дней)")
    op list(): BookingAPI.Availability[];

    @doc("Обновить рабочие часы для конкретного дня недели")
    @put
    op update(@body body: UpdateAvailabilityRequest): BookingAPI.Availability | NotFoundError;
  }
}

// ─────────────────────────────────────────────
//  Public API — для гостей
// ─────────────────────────────────────────────

@route("/public")
@tag("Public")
namespace Public {

  @route("/event-types")
  namespace EventTypes {

    @doc("Список доступных типов событий для бронирования")
    op list(): EventType[];

    @route("/{eventTypeId}/slots")
    namespace Slots {

      @doc("Свободные слоты на выбранную дату для данного типа события")
      op list(
        @path eventTypeId: string,

        @query
        @doc("Дата в формате YYYY-MM-DD")
        date: plainDate,
      ): Slot[] | NotFoundError;
    }
  }

  @route("/bookings")
  namespace Bookings {

    @doc("Создать бронирование на выбранный слот")
    op create(@body body: CreateBookingRequest): {
      @statusCode statusCode: 201;
      @body body: Booking;
    } | ConflictError | NotFoundError;
  }
}
