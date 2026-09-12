import BookingSeatClient from "./BookingSeatClient";

export function generateStaticParams() {
  return [
    { showtimeId: "st-0-a1111111-0" },
    { showtimeId: "st-0-a1111111-1" },
    { showtimeId: "st-0-a1111111-2" },
    { showtimeId: "st-0-a1111111-3" },
    { showtimeId: "preview" },
  ];
}

export default function BookingPage() {
  return <BookingSeatClient />;
}
