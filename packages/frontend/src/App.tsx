import { Routes, Route } from 'react-router';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import BookingPage from '@/pages/BookingPage';
import EventsPage from '@/pages/EventsPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="events" element={<EventsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
