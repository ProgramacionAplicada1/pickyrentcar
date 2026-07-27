import ReservationHeader from "./components/layout/ReservationHeader";
import ReservationStats from "./components/layout/ReservationStats";
import ReservationToolbar from "./components/layout/ReservationToolbar";
import ReservationTabs from "./components/layout/ReservationTabs";
import ReservationList from "./components/layout/ReservationList";

export default function ReservationsPage() {
  return (
    <div className="space-y-8 p-6">
      <ReservationHeader />
      <ReservationStats />
      <ReservationToolbar />
      <ReservationTabs />
      <ReservationList />
    </div>
  );
}