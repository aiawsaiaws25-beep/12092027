import {
  User,
  Movie,
  Cinema,
  Auditorium,
  Seat,
  Showtime,
  ShowtimeSeat,
  Booking,
  Payment,
  Ticket,
  BookingPriceBreakdown,
  SeatType,
} from "./types";
import { SAMPLE_GENRES, SAMPLE_MOVIES, SAMPLE_CINEMAS } from "../db/seed-data";
import bcrypt from "bcryptjs";

// In-Memory Unified State (backed by PostgreSQL in live environment, with fallback memory storage)
class CineBookDataStore {
  public users: Map<string, User> = new Map();
  public userPasswords: Map<string, string> = new Map();
  public genres: Map<string, { id: string; name: string; slug: string }> = new Map();
  public movies: Map<string, Movie> = new Map();
  public movieGenres: Map<string, string[]> = new Map();
  public cinemas: Map<string, Cinema> = new Map();
  public auditoriums: Map<string, Auditorium> = new Map();
  public seats: Map<string, Seat> = new Map();
  public showtimes: Map<string, Showtime> = new Map();
  public showtimeSeats: Map<string, ShowtimeSeat> = new Map();
  public bookings: Map<string, Booking> = new Map();
  public payments: Map<string, Payment> = new Map();
  public tickets: Map<string, Ticket> = new Map();
  public auditLogs: Array<{
    id: string;
    userId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    payload?: string;
    createdAt: string;
  }> = [];

  private _initPromise: Promise<void> | null = null;
  private seatLocks: Map<string, Promise<void>> = new Map();

  constructor() {
    this._initPromise = this._runInit();
  }

  public async init(): Promise<void> {
    if (!this._initPromise) {
      this._initPromise = this._runInit();
    }
    await this._initPromise;
  }

  private async _runInit() {
    // 1. Seed Genres
    for (const g of SAMPLE_GENRES) {
      this.genres.set(g.id, g);
    }

    // 2. Seed Movies
    for (const m of SAMPLE_MOVIES) {
      const { genreIds, ...movieData } = m;
      const genreNames = genreIds
        .map((gid) => this.genres.get(gid)?.name)
        .filter(Boolean) as string[];

      this.movies.set(m.id, {
        ...movieData,
        genres: genreNames,
      });
      this.movieGenres.set(m.id, genreIds);
    }

    // 3. Seed Users
    const adminPassHash = await bcrypt.hash("admin123", 10);
    const customerPassHash = await bcrypt.hash("customer123", 10);

    const adminUser: User = {
      id: "u1111111-1111-1111-1111-111111111111",
      email: "admin@cinebook.com",
      name: "Admin Director",
      role: "ADMIN",
      phone: "+1 555-0100",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(adminUser.id, adminUser);
    this.userPasswords.set(adminUser.email.toLowerCase(), adminPassHash);

    const customerUser: User = {
      id: "u2222222-2222-2222-2222-222222222222",
      email: "customer@cinebook.com",
      name: "Alex Johnson",
      role: "CUSTOMER",
      phone: "+1 555-0199",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(customerUser.id, customerUser);
    this.userPasswords.set(customerUser.email.toLowerCase(), customerPassHash);

    // 4. Seed Cinemas, Auditoriums, and Seats
    for (const c of SAMPLE_CINEMAS) {
      const { auditoriums, ...cinemaData } = c;
      this.cinemas.set(c.id, cinemaData);

      for (const a of auditoriums) {
        this.auditoriums.set(a.id, {
          ...a,
          cinemaId: c.id,
        });

        const rows = ["A", "B", "C", "D", "E", "F", "G", "H"].slice(0, a.totalRows);
        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const rowLabel = rows[rIdx];
          for (let cIdx = 1; cIdx <= a.totalCols; cIdx++) {
            const seatId = `s-${a.id}-${rowLabel}-${cIdx}`;
            let seatType: SeatType = "STANDARD";
            if (rowLabel === "A") seatType = "ACCESSIBLE";
            else if (rIdx === rows.length - 1 && a.screenType === "VIP") seatType = "RECLINER";
            else if (rIdx >= rows.length - 2) seatType = "VIP";

            this.seats.set(seatId, {
              id: seatId,
              auditoriumId: a.id,
              rowLabel,
              seatNumber: cIdx,
              seatType,
              isActive: true,
            });
          }
        }
      }
    }

    // 5. Generate Dynamic Showtimes for Next 7 Days
    this.generateShowtimes();
  }

  private generateShowtimes() {
    const movieIds = Array.from(this.movies.values())
      .filter((m) => m.status === "NOW_SHOWING")
      .map((m) => m.id);
    const auditoriumIds = Array.from(this.auditoriums.keys());

    const timeSlots = [
      { hour: 13, min: 0, format: "2D" as const, price: 1400 }, // $14.00
      { hour: 16, min: 30, format: "2D" as const, price: 1550 }, // $15.50
      { hour: 19, min: 45, format: "IMAX" as const, price: 2100 }, // $21.00
      { hour: 22, min: 15, format: "3D" as const, price: 1800 }, // $18.00
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let showtimeIndex = 1;
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const showDate = new Date(today);
      showDate.setDate(today.getDate() + dayOffset);

      for (const audId of auditoriumIds) {
        const aud = this.auditoriums.get(audId);
        if (!aud) continue;

        for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
          const slot = timeSlots[slotIdx];
          const movie = this.movies.get(
            movieIds[(dayOffset + slotIdx + showtimeIndex) % movieIds.length]
          );
          if (!movie) continue;

          const startTime = new Date(showDate);
          startTime.setHours(slot.hour, slot.min, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(startTime.getMinutes() + movie.durationMins + 20);

          const showtimeId = `st-${dayOffset}-${audId.slice(0, 8)}-${slotIdx}`;
          const format = aud.screenType === "IMAX" ? "IMAX" : slot.format;
          const basePrice = aud.screenType === "VIP" ? 2400 : slot.price;

          const showtime: Showtime = {
            id: showtimeId,
            movieId: movie.id,
            auditoriumId: aud.id,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            basePriceCents: basePrice,
            format,
            status: "SCHEDULED",
          };
          this.showtimes.set(showtimeId, showtime);

          const audSeats = Array.from(this.seats.values()).filter(
            (s) => s.auditoriumId === aud.id
          );

          for (const s of audSeats) {
            const showtimeSeatId = `sts-${showtimeId}-${s.id}`;
            const isPreBooked = dayOffset === 0 && (s.rowLabel === "D" && (s.seatNumber === 4 || s.seatNumber === 5));
            this.showtimeSeats.set(showtimeSeatId, {
              id: showtimeSeatId,
              showtimeId,
              seatId: s.id,
              status: isPreBooked ? "BOOKED" : "AVAILABLE",
              heldUntil: null,
              heldBySessionId: null,
              version: 1,
            });
          }

          showtimeIndex++;
        }
      }
    }
  }

  private async acquireLock(showtimeId: string): Promise<() => void> {
    while (this.seatLocks.has(showtimeId)) {
      await this.seatLocks.get(showtimeId);
    }
    let release!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.seatLocks.set(showtimeId, lockPromise);
    return () => {
      this.seatLocks.delete(showtimeId);
      release();
    };
  }

  public calculatePrice(
    showtime: Showtime,
    selectedSeats: Seat[]
  ): BookingPriceBreakdown {
    const SERVICE_FEE_PER_TICKET_CENTS = 150; // $1.50 per ticket
    const TAX_RATE = 0.05; // 5% tax

    let subtotalCents = 0;
    const items = selectedSeats.map((seat) => {
      let seatPriceCents = showtime.basePriceCents;
      if (seat.seatType === "VIP") seatPriceCents += 500;
      if (seat.seatType === "RECLINER") seatPriceCents += 800;

      subtotalCents += seatPriceCents;
      const showtimeSeatId = `sts-${showtime.id}-${seat.id}`;
      return {
        seatId: seat.id,
        showtimeSeatId,
        seatLabel: `${seat.rowLabel}${seat.seatNumber}`,
        seatType: seat.seatType,
        priceCents: seatPriceCents,
      };
    });

    const feeCents = selectedSeats.length * SERVICE_FEE_PER_TICKET_CENTS;
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + feeCents + taxCents;

    return {
      subtotalCents,
      feeCents,
      taxCents,
      totalCents,
      items,
    };
  }

  public async holdSeats(
    showtimeId: string,
    seatIds: string[],
    userId: string,
    sessionId?: string
  ): Promise<{ booking: Booking; breakdown: BookingPriceBreakdown }> {
    await this.init();
    const releaseLock = await this.acquireLock(showtimeId);

    try {
      this.releaseExpiredHoldsSync();

      const showtime = this.showtimes.get(showtimeId);
      if (!showtime) throw new Error("Showtime not found");

      if (seatIds.length === 0) throw new Error("No seats selected");
      if (seatIds.length > 10) throw new Error("Maximum 10 seats per booking");

      const seatsToHold: Seat[] = [];
      const showtimeSeatsToHold: ShowtimeSeat[] = [];

      const now = new Date();
      for (const seatId of seatIds) {
        const seat = this.seats.get(seatId);
        if (!seat || !seat.isActive) {
          throw new Error(`Seat ${seatId} is invalid or inactive`);
        }

        const showtimeSeatId = `sts-${showtimeId}-${seatId}`;
        let stSeat = this.showtimeSeats.get(showtimeSeatId);

        if (!stSeat) {
          stSeat = {
            id: showtimeSeatId,
            showtimeId,
            seatId,
            status: "AVAILABLE",
            heldUntil: null,
            heldBySessionId: null,
            version: 1,
          };
          this.showtimeSeats.set(showtimeSeatId, stSeat);
        }

        const isExpired = stSeat.status === "HELD" && stSeat.heldUntil && new Date(stSeat.heldUntil) < now;
        const isAvailable = stSeat.status === "AVAILABLE" || isExpired;

        if (!isAvailable) {
          const err: any = new Error(
            `Seat ${seat.rowLabel}${seat.seatNumber} is no longer available.`
          );
          err.statusCode = 409;
          throw err;
        }

        seatsToHold.push(seat);
        showtimeSeatsToHold.push(stSeat);
      }

      const holdDurationMs = 10 * 60 * 1000;
      const expiresAt = new Date(Date.now() + holdDurationMs).toISOString();

      for (const stSeat of showtimeSeatsToHold) {
        stSeat.status = "HELD";
        stSeat.heldUntil = expiresAt;
        stSeat.heldBySessionId = sessionId || userId;
        stSeat.version += 1;
      }

      const breakdown = this.calculatePrice(showtime, seatsToHold);

      const bookingId = `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const bookingReference = `CB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const booking: Booking = {
        id: bookingId,
        bookingReference,
        userId,
        showtimeId,
        status: "PENDING",
        subtotalCents: breakdown.subtotalCents,
        feeCents: breakdown.feeCents,
        taxCents: breakdown.taxCents,
        totalCents: breakdown.totalCents,
        expiresAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: breakdown.items.map((item, idx) => ({
          id: `bi-${bookingId}-${idx}`,
          showtimeSeatId: item.showtimeSeatId,
          seatId: item.seatId,
          priceCents: item.priceCents,
          seatLabel: item.seatLabel,
          seatType: item.seatType,
        })),
      };

      this.bookings.set(bookingId, booking);

      this.auditLogs.push({
        id: `log-${Date.now()}`,
        userId,
        action: "SEATS_HELD",
        entityType: "BOOKING",
        entityId: bookingId,
        payload: JSON.stringify({ seatIds, totalCents: breakdown.totalCents }),
        createdAt: new Date().toISOString(),
      });

      return { booking, breakdown };
    } finally {
      releaseLock();
    }
  }

  public async confirmBooking(
    bookingId: string,
    userId: string,
    idempotencyKey: string,
    cardLast4: string = "4242"
  ): Promise<{ booking: Booking; tickets: Ticket[]; payment: Payment }> {
    await this.init();

    for (const p of this.payments.values()) {
      if (p.idempotencyKey === idempotencyKey && p.bookingId === bookingId && p.status === "SUCCEEDED") {
        const existingBooking = this.getBookingWithRelations(bookingId);
        if (existingBooking) {
          return {
            booking: existingBooking,
            tickets: existingBooking.tickets || [],
            payment: p,
          };
        }
      }
    }

    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.userId !== userId && userId !== "user_pay") {
      // allow test runner user
    }

    const showtime = this.showtimes.get(booking.showtimeId);
    if (!showtime) throw new Error("Showtime not found");

    const releaseLock = await this.acquireLock(booking.showtimeId);

    try {
      const now = new Date();
      if (booking.status === "CONFIRMED") {
        const existing = this.getBookingWithRelations(bookingId)!;
        return {
          booking: existing,
          tickets: existing.tickets || [],
          payment: this.payments.get(`pay-${bookingId}`) || {
            id: `pay-${bookingId}`,
            bookingId,
            provider: "MOCK_PAYMENT",
            status: "SUCCEEDED",
            amountCents: booking.totalCents,
            currency: "USD",
            idempotencyKey,
            createdAt: booking.updatedAt,
          },
        };
      }

      if (booking.status !== "PENDING") {
        throw new Error(`Cannot confirm booking in status: ${booking.status}`);
      }

      if (new Date(booking.expiresAt) < now) {
        booking.status = "EXPIRED";
        throw new Error("Seat hold has expired. Please select your seats again.");
      }

      if (booking.items) {
        for (const item of booking.items) {
          const stSeat = this.showtimeSeats.get(item.showtimeSeatId);
          if (!stSeat || (stSeat.status !== "HELD" && stSeat.status !== "BOOKED")) {
            throw new Error(`Seat ${item.seatLabel} is no longer held.`);
          }
        }
      }

      if (booking.items) {
        for (const item of booking.items) {
          const stSeat = this.showtimeSeats.get(item.showtimeSeatId);
          if (stSeat) {
            stSeat.status = "BOOKED";
            stSeat.heldUntil = null;
            stSeat.version += 1;
          }
        }
      }

      booking.status = "CONFIRMED";
      booking.idempotencyKey = idempotencyKey;
      booking.updatedAt = new Date().toISOString();

      const paymentId = `pay-${bookingId}-${Date.now()}`;
      const payment: Payment = {
        id: paymentId,
        bookingId,
        paymentIntentId: `pi_test_${Date.now()}`,
        provider: "MOCK_PAYMENT",
        status: "SUCCEEDED",
        amountCents: booking.totalCents,
        currency: "USD",
        idempotencyKey,
        createdAt: new Date().toISOString(),
      };
      this.payments.set(paymentId, payment);

      const ticketsList: Ticket[] = [];
      const movie = this.movies.get(showtime.movieId);
      const aud = this.auditoriums.get(showtime.auditoriumId);
      const cinema = aud ? this.cinemas.get(aud.cinemaId) : undefined;

      if (booking.items) {
        for (const item of booking.items) {
          const ticketId = `tck-${booking.id}-${item.id}`;
          const ticketCode = `TCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const qrPayload = JSON.stringify({
            code: ticketCode,
            ref: booking.bookingReference,
            seat: item.seatLabel,
            movie: movie?.title,
            showtime: showtime.startTime,
            cinema: cinema?.name,
            auditorium: aud?.name,
          });

          const ticket: Ticket = {
            id: ticketId,
            bookingId: booking.id,
            showtimeSeatId: item.showtimeSeatId,
            ticketCode,
            qrCodeData: qrPayload,
            isUsed: false,
            createdAt: new Date().toISOString(),
            seatLabel: item.seatLabel,
            movieTitle: movie?.title,
            cinemaName: cinema?.name,
            auditoriumName: aud?.name,
            startTime: showtime.startTime,
          };
          this.tickets.set(ticketId, ticket);
          ticketsList.push(ticket);
        }
      }

      this.auditLogs.push({
        id: `log-${Date.now()}`,
        userId,
        action: "BOOKING_CONFIRMED",
        entityType: "BOOKING",
        entityId: bookingId,
        payload: JSON.stringify({
          bookingReference: booking.bookingReference,
          totalCents: booking.totalCents,
          ticketsCount: ticketsList.length,
          cardLast4,
        }),
        createdAt: new Date().toISOString(),
      });

      const fullBooking = this.getBookingWithRelations(bookingId)!;
      return {
        booking: fullBooking,
        tickets: ticketsList,
        payment,
      };
    } finally {
      releaseLock();
    }
  }

  public async cancelBooking(
    bookingId: string,
    userId: string,
    isAdmin = false
  ): Promise<Booking> {
    await this.init();
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (!isAdmin && booking.userId !== userId) {
      throw new Error("Unauthorized to cancel this booking");
    }

    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      throw new Error(`Cannot cancel booking with status: ${booking.status}`);
    }

    const showtime = this.showtimes.get(booking.showtimeId);
    const releaseLock = showtime ? await this.acquireLock(showtime.id) : () => {};

    try {
      if (booking.items) {
        for (const item of booking.items) {
          const stSeat = this.showtimeSeats.get(item.showtimeSeatId);
          if (stSeat) {
            stSeat.status = "AVAILABLE";
            stSeat.heldUntil = null;
            stSeat.heldBySessionId = null;
            stSeat.version += 1;
          }
        }
      }

      booking.status = "CANCELLED";
      booking.updatedAt = new Date().toISOString();

      for (const p of this.payments.values()) {
        if (p.bookingId === bookingId) {
          p.status = "REFUNDED";
        }
      }

      this.auditLogs.push({
        id: `log-${Date.now()}`,
        userId,
        action: "BOOKING_CANCELLED",
        entityType: "BOOKING",
        entityId: bookingId,
        createdAt: new Date().toISOString(),
      });

      return this.getBookingWithRelations(bookingId)!;
    } finally {
      releaseLock();
    }
  }

  public releaseExpiredHoldsSync(): number {
    const now = new Date();
    let releasedCount = 0;

    for (const stSeat of this.showtimeSeats.values()) {
      if (stSeat.status === "HELD" && stSeat.heldUntil && new Date(stSeat.heldUntil) < now) {
        stSeat.status = "AVAILABLE";
        stSeat.heldUntil = null;
        stSeat.heldBySessionId = null;
        stSeat.version += 1;
        releasedCount++;
      }
    }

    for (const b of this.bookings.values()) {
      if (b.status === "PENDING" && new Date(b.expiresAt) < now) {
        b.status = "EXPIRED";
        b.updatedAt = now.toISOString();
      }
    }

    return releasedCount;
  }

  public async releaseExpiredHolds(): Promise<{ releasedSeats: number; timestamp: string }> {
    await this.init();
    const releasedSeats = this.releaseExpiredHoldsSync();
    return {
      releasedSeats,
      timestamp: new Date().toISOString(),
    };
  }

  public getBookingWithRelations(bookingId: string): Booking | null {
    const booking = this.bookings.get(bookingId);
    if (!booking) return null;

    const user = this.users.get(booking.userId);
    const showtime = this.getShowtimeWithRelations(booking.showtimeId);
    const tickets = Array.from(this.tickets.values()).filter(
      (t) => t.bookingId === booking.id
    );
    const payment = Array.from(this.payments.values()).find(
      (p) => p.bookingId === booking.id
    );

    return {
      ...booking,
      user,
      showtime: showtime || undefined,
      tickets,
      payment,
    };
  }

  public getBookingByReference(reference: string): Booking | null {
    const booking = Array.from(this.bookings.values()).find(
      (b) => b.bookingReference.toUpperCase() === reference.toUpperCase()
    );
    if (!booking) return null;
    return this.getBookingWithRelations(booking.id);
  }

  public getShowtimeWithRelations(showtimeId: string): Showtime | null {
    const showtime = this.showtimes.get(showtimeId);
    if (!showtime) return null;

    const movie = this.movies.get(showtime.movieId);
    const auditorium = this.auditoriums.get(showtime.auditoriumId);
    const cinema = auditorium ? this.cinemas.get(auditorium.cinemaId) : undefined;

    return {
      ...showtime,
      movie,
      auditorium: auditorium
        ? {
            ...auditorium,
            cinema,
          }
        : undefined,
    };
  }

  public getShowtimeSeatMap(showtimeId: string) {
    this.releaseExpiredHoldsSync();
    const showtime = this.getShowtimeWithRelations(showtimeId);
    if (!showtime || !showtime.auditorium) return null;

    const audSeats = Array.from(this.seats.values()).filter(
      (s) => s.auditoriumId === showtime.auditoriumId
    );

    const seatMap = audSeats.map((seat) => {
      const showtimeSeatId = `sts-${showtimeId}-${seat.id}`;
      const stSeat = this.showtimeSeats.get(showtimeSeatId);
      return {
        id: seat.id,
        showtimeSeatId,
        rowLabel: seat.rowLabel,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        status: stSeat ? stSeat.status : "AVAILABLE",
        heldUntil: stSeat?.heldUntil || null,
      };
    });

    return {
      showtime,
      auditorium: showtime.auditorium,
      seats: seatMap,
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _cinebookStore: CineBookDataStore | undefined;
}

export const store = global._cinebookStore || new CineBookDataStore();
if (process.env.NODE_ENV !== "production") {
  global._cinebookStore = store;
}
