import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  unique,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ["CUSTOMER", "ADMIN"] })
      .notNull()
      .default("CUSTOMER"),
    phone: text("phone"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

// 2. Movies Table
export const movies = pgTable(
  "movies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    posterUrl: text("poster_url").notNull(),
    backdropUrl: text("backdrop_url"),
    trailerUrl: text("trailer_url"),
    durationMins: integer("duration_mins").notNull(),
    rating: text("rating").notNull(), // PG-13, R, PG, etc.
    releaseDate: text("release_date").notNull(),
    language: text("language").notNull(),
    status: text("status", {
      enum: ["NOW_SHOWING", "COMING_SOON", "ARCHIVED"],
    })
      .notNull()
      .default("NOW_SHOWING"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusIdx: index("movies_status_idx").on(table.status),
    slugIdx: index("movies_slug_idx").on(table.slug),
  })
);

// 3. Genres Table
export const genres = pgTable("genres", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

// 4. Movie Genres Association Table
export const movieGenres = pgTable(
  "movie_genres",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.movieId, table.genreId] }),
  })
);

// 5. Cinemas Table
export const cinemas = pgTable(
  "cinemas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    phone: text("phone"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    cityIdx: index("cinemas_city_idx").on(table.city),
    slugIdx: index("cinemas_slug_idx").on(table.slug),
  })
);

// 6. Auditoriums Table
export const auditoriums = pgTable(
  "auditoriums",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cinemaId: uuid("cinema_id")
      .notNull()
      .references(() => cinemas.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    totalRows: integer("total_rows").notNull(),
    totalCols: integer("total_cols").notNull(),
    seatingCapacity: integer("seating_capacity").notNull(),
    soundSystem: text("sound_system").default("Dolby Atmos"),
    screenType: text("screen_type", {
      enum: ["STANDARD", "IMAX", "4DX", "VIP"],
    })
      .notNull()
      .default("STANDARD"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueScreenPerCinema: unique("auditorium_cinema_name_idx").on(
      table.cinemaId,
      table.name
    ),
  })
);

// 7. Seats Table
export const seats = pgTable(
  "seats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditoriumId: uuid("auditorium_id")
      .notNull()
      .references(() => auditoriums.id, { onDelete: "cascade" }),
    rowLabel: varchar("row_label", { length: 5 }).notNull(),
    seatNumber: integer("seat_number").notNull(),
    seatType: text("seat_type", {
      enum: ["STANDARD", "VIP", "RECLINER", "ACCESSIBLE"],
    })
      .notNull()
      .default("STANDARD"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueSeatPosition: unique("seat_auditorium_position_idx").on(
      table.auditoriumId,
      table.rowLabel,
      table.seatNumber
    ),
    auditoriumIdx: index("seats_auditorium_idx").on(table.auditoriumId),
  })
);

// 8. Showtimes Table
export const showtimes = pgTable(
  "showtimes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    auditoriumId: uuid("auditorium_id")
      .notNull()
      .references(() => auditoriums.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time", { withTimezone: true, mode: "string" }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true, mode: "string" }).notNull(),
    basePriceCents: integer("base_price_cents").notNull(), // stored in minor units
    format: text("format", { enum: ["2D", "3D", "IMAX", "4DX"] })
      .notNull()
      .default("2D"),
    status: text("status", {
      enum: ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"],
    })
      .notNull()
      .default("SCHEDULED"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    movieStartTimeIdx: index("showtimes_movie_start_idx").on(
      table.movieId,
      table.startTime
    ),
    auditoriumStartTimeIdx: index("showtimes_auditorium_start_idx").on(
      table.auditoriumId,
      table.startTime
    ),
  })
);

// 9. Showtime Seats (Real-time seat state per showtime)
export const showtimeSeats = pgTable(
  "showtime_seats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    showtimeId: uuid("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    seatId: uuid("seat_id")
      .notNull()
      .references(() => seats.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["AVAILABLE", "HELD", "BOOKED", "BLOCKED"],
    })
      .notNull()
      .default("AVAILABLE"),
    heldUntil: timestamp("held_until", { withTimezone: true, mode: "string" }),
    heldBySessionId: text("held_by_session_id"),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueShowtimeSeat: unique("showtime_seat_unique_idx").on(
      table.showtimeId,
      table.seatId
    ),
    showtimeStatusIdx: index("showtime_seats_status_idx").on(
      table.showtimeId,
      table.status
    ),
    heldUntilIdx: index("showtime_seats_held_until_idx").on(table.heldUntil),
  })
);

// 10. Bookings Table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingReference: text("booking_reference").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    showtimeId: uuid("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED", "REFUNDED"],
    })
      .notNull()
      .default("PENDING"),
    subtotalCents: integer("subtotal_cents").notNull(),
    feeCents: integer("fee_cents").notNull(),
    taxCents: integer("tax_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    idempotencyKey: text("idempotency_key").unique(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("bookings_user_idx").on(table.userId),
    refIdx: index("bookings_ref_idx").on(table.bookingReference),
    statusIdx: index("bookings_status_idx").on(table.status),
    expiresIdx: index("bookings_expires_idx").on(table.expiresAt),
  })
);

// 11. Booking Items Table
export const bookingItems = pgTable("booking_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  showtimeSeatId: uuid("showtime_seat_id")
    .notNull()
    .references(() => showtimeSeats.id, { onDelete: "cascade" }),
  seatId: uuid("seat_id")
    .notNull()
    .references(() => seats.id, { onDelete: "cascade" }),
  priceCents: integer("price_cents").notNull(),
  seatLabel: text("seat_label").notNull(), // e.g. "E12"
  seatType: text("seat_type").notNull(),
});

// 12. Payments Table
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    paymentIntentId: text("payment_intent_id"),
    provider: text("provider", {
      enum: ["STRIPE_TEST", "MOCK_PAYMENT"],
    })
      .notNull()
      .default("MOCK_PAYMENT"),
    status: text("status", {
      enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"],
    })
      .notNull()
      .default("PENDING"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    idempotencyKey: text("idempotency_key").unique(),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    bookingIdx: index("payments_booking_idx").on(table.bookingId),
    idempotencyIdx: index("payments_idempotency_idx").on(table.idempotencyKey),
  })
);

// 13. Tickets Table
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    showtimeSeatId: uuid("showtime_seat_id")
      .notNull()
      .references(() => showtimeSeats.id, { onDelete: "cascade" }),
    ticketCode: text("ticket_code").notNull().unique(), // e.g. "TCK-892182"
    qrCodeData: text("qr_code_data").notNull(),
    isUsed: boolean("is_used").notNull().default(false),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ticketCodeIdx: index("tickets_code_idx").on(table.ticketCode),
    bookingIdx: index("tickets_booking_idx").on(table.bookingId),
  })
);

// 14. Audit Logs Table
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    payload: text("payload"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    actionIdx: index("audit_logs_action_idx").on(table.action),
    entityIdx: index("audit_logs_entity_idx").on(
      table.entityType,
      table.entityId
    ),
  })
);

// Drizzle Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  auditLogs: many(auditLogs),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  movieGenres: many(movieGenres),
  showtimes: many(showtimes),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  movieGenres: many(movieGenres),
}));

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, {
    fields: [movieGenres.movieId],
    references: [movies.id],
  }),
  genre: one(genres, {
    fields: [movieGenres.genreId],
    references: [genres.id],
  }),
}));

export const cinemasRelations = relations(cinemas, ({ many }) => ({
  auditoriums: many(auditoriums),
}));

export const auditoriumsRelations = relations(auditoriums, ({ one, many }) => ({
  cinema: one(cinemas, {
    fields: [auditoriums.cinemaId],
    references: [cinemas.id],
  }),
  seats: many(seats),
  showtimes: many(showtimes),
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
  auditorium: one(auditoriums, {
    fields: [seats.auditoriumId],
    references: [auditoriums.id],
  }),
  showtimeSeats: many(showtimeSeats),
}));

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.id],
  }),
  auditorium: one(auditoriums, {
    fields: [showtimes.auditoriumId],
    references: [auditoriums.id],
  }),
  showtimeSeats: many(showtimeSeats),
  bookings: many(bookings),
}));

export const showtimeSeatsRelations = relations(showtimeSeats, ({ one }) => ({
  showtime: one(showtimes, {
    fields: [showtimeSeats.showtimeId],
    references: [showtimes.id],
  }),
  seat: one(seats, {
    fields: [showtimeSeats.seatId],
    references: [seats.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.id],
  }),
  bookingItems: many(bookingItems),
  payments: many(payments),
  tickets: many(tickets),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingItems.bookingId],
    references: [bookings.id],
  }),
  showtimeSeat: one(showtimeSeats, {
    fields: [bookingItems.showtimeSeatId],
    references: [showtimeSeats.id],
  }),
  seat: one(seats, {
    fields: [bookingItems.seatId],
    references: [seats.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  booking: one(bookings, {
    fields: [tickets.bookingId],
    references: [bookings.id],
  }),
  showtimeSeat: one(showtimeSeats, {
    fields: [tickets.showtimeSeatId],
    references: [showtimeSeats.id],
  }),
}));
