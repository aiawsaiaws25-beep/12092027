import TicketClient from "./TicketClient";

export function generateStaticParams() {
  return [
    { bookingReference: "CB-DEMO" },
    { bookingReference: "CB-7X9K2L" },
    { bookingReference: "CB-3M8N1P" },
    { bookingReference: "preview" },
  ];
}

export default function TicketPage() {
  return <TicketClient />;
}
