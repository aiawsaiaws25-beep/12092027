export type SeatType = "STANDARD" | "VIP" | "RECLINER" | "ACCESSIBLE";
export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
export type UserRole = "CUSTOMER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  durationMins: number;
  rating: string;
  releaseDate: string;
  language: string;
  status: "NOW_SHOWING" | "COMING_SOON" | "ARCHIVED";
  genres?: string[];
}

export interface Cinema {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string | null;
}

export interface Auditorium {
  id: string;
  cinemaId: string;
  name: string;
  totalRows: number;
  totalCols: number;
  seatingCapacity: number;
  soundSystem: string;
  screenType: "STANDARD" | "IMAX" | "4DX" | "VIP";
}

export interface Seat {
  id: string;
  auditoriumId: string;
  rowLabel: string;
  seatNumber: number;
  seatType: SeatType;
  isActive: boolean;
}

export interface Showtime {
  id: string;
  movieId: string;
  auditoriumId: string;
  startTime: string;
  endTime: string;
  basePriceCents: number;
  format: "2D" | "3D" | "IMAX" | "4DX";
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  movie?: Movie;
  auditorium?: Auditorium & { cinema?: Cinema };
}

export interface ShowtimeSeat {
  id: string;
  showtimeId: string;
  seatId: string;
  status: SeatStatus;
  heldUntil?: string | null;
  heldBySessionId?: string | null;
  version: number;
  seat?: Seat;
}

export interface BookingPriceBreakdown {
  subtotalCents: number;
  feeCents: number;
  taxCents: number;
  totalCents: number;
  items: {
    seatId: string;
    showtimeSeatId: string;
    seatLabel: string;
    seatType: SeatType;
    priceCents: number;
  }[];
}

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  showtimeId: string;
  status: BookingStatus;
  subtotalCents: number;
  feeCents: number;
  taxCents: number;
  totalCents: number;
  expiresAt: string;
  idempotencyKey?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: {
    id: string;
    showtimeSeatId: string;
    seatId: string;
    priceCents: number;
    seatLabel: string;
    seatType: string;
  }[];
  showtime?: Showtime;
  user?: User;
  tickets?: Ticket[];
  payment?: Payment;
}

export interface Payment {
  id: string;
  bookingId: string;
  paymentIntentId?: string | null;
  provider: "STRIPE_TEST" | "MOCK_PAYMENT";
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  idempotencyKey?: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  bookingId: string;
  showtimeSeatId: string;
  ticketCode: string;
  qrCodeData: string;
  isUsed: boolean;
  usedAt?: string | null;
  createdAt: string;
  seatLabel?: string;
  movieTitle?: string;
  cinemaName?: string;
  auditoriumName?: string;
  startTime?: string;
}

export interface HoldSeatsRequest {
  showtimeId: string;
  seatIds: string[];
  userId: string;
  sessionId?: string;
}

export interface ConfirmBookingRequest {
  bookingId: string;
  userId: string;
  paymentMethodId?: string;
  idempotencyKey: string;
  cardLast4?: string;
}
