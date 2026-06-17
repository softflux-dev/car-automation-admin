import { useEffect, useState, useCallback } from "react";
import { addWeeks, subWeeks } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllEvents,
  createCalendarEvent,
} from "../redux/calendarThunks";
import {
  setSelectedEvent,
  openCreateModal,
  closeCreateModal,
  openEventModal,
  closeEventModal,
} from "../redux/calendarSlice";
import CalendarHeader from "../components/CalendarHeader";
import CalendarGrid from "../components/CalendarGrid";
import CreateEventModal from "../components/CreateEventModal";
import EventDetailsModal from "../components/EventDetailsModal";

const CalendarPage = () => {
  const dispatch = useAppDispatch();
  const {
    events,
    loading,
    selectedEvent,
    isCreateModalOpen,
    isEventModalOpen,
  } = useAppSelector((state) => state.calendar);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [prefilledSlot, setPrefilledSlot] = useState(null);

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  const handlePrevWeek = useCallback(() => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleSlotClick = useCallback(
    (slot) => {
      setPrefilledSlot(slot);
      dispatch(openCreateModal());
    },
    [dispatch]
  );

  const handleEventClick = useCallback(
    (event) => {
      dispatch(setSelectedEvent(event));
      dispatch(openEventModal());
    },
    [dispatch]
  );

  const handleCreateEvent = useCallback(
    (payload) => {
      dispatch(createCalendarEvent(payload)).then(() => {
        dispatch(closeCreateModal());
        setPrefilledSlot(null);
        dispatch(fetchAllEvents());
      });
    },
    [dispatch]
  );

  const handleCloseCreateModal = useCallback(() => {
    dispatch(closeCreateModal());
    setPrefilledSlot(null);
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-dashboard-title">Kalender</h1>
      </div>

      <CalendarHeader
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      {loading && events.length === 0 ? (
        <div className="premium-card flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Evenementen laden...</p>
          </div>
        </div>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
      )}

      <CreateEventModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateEvent}
        prefilledSlot={prefilledSlot}
        loading={loading}
      />

      <EventDetailsModal
        open={isEventModalOpen}
        onClose={() => dispatch(closeEventModal())}
        event={selectedEvent}
      />

      {/* Mobile FAB */}
      <button
        onClick={() => {
          setPrefilledSlot(null);
          dispatch(openCreateModal());
        }}
        className="lg:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
};

export default CalendarPage;
