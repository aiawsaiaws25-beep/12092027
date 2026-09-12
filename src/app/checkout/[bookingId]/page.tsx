import CheckoutClient from "./CheckoutClient";

export function generateStaticParams() {
  return [
    { bookingId: "b-demo" },
    { bookingId: "preview" },
    { bookingId: "b-active-1" },
    { bookingId: "b-active-2" },
  ];
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}
