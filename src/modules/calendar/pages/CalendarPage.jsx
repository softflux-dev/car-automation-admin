import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { addWeeks, subWeeks } from "date-fns";
import { AlertCircle, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CalendarPage = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const {
    events,
    eventsLoading,
    creatingLoading,
    updatingLoading,
    deletingLoading,
    error,
    selectedEvent,
    isCreateModalOpen,
    isEventModalOpen,
  } = useAppSelector((state) => state.calendar);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [prefilledSlot, setPrefilledSlot] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [dismissedError, setDismissedError] = useState(false);

  const editPrefilledSlot = useMemo(
    () => (editingEvent ? { start: new Date(editingEvent.start), end: new Date(editingEvent.end) } : null),
    [editingEvent]
  );

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  useEffect(() => {
    if (error) setDismissedError(false);
  }, [error]);

  const handlePrevWeek = useCallback(() => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleGoToDate = useCallback((date) => {
    setCurrentDate(date);
  }, []);

  const handleSlotClick = useCallback(
    (slot) => {
      setPrefilledSlot(slot);
      setEditingEvent(null);
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
      dispatch(createCalendarEvent(payload)).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          toast({ title: "Succes", description: "Evenement succesvol aangemaakt" });
          dispatch(closeCreateModal());
          setPrefilledSlot(null);
          setEditingEvent(null);
          dispatch(fetchAllEvents());
        } else {
          toast({
            title: "Fout",
            description: res.payload?.message || "Fout bij het aanmaken van evenement",
            variant: "destructive",
          });
        }
      });
    },
    [dispatch, toast]
  );

  const handleEditEvent = useCallback(
    (event) => {
      setEditingEvent(event);
      dispatch(setSelectedEvent(null));
      dispatch(closeEventModal());
      dispatch(openCreateModal());
    },
    [dispatch]
  );

  const handleUpdateEvent = useCallback(
    (payload) => {
      dispatch(updateCalendarEvent({ id: editingEvent.id, ...payload })).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          toast({ title: "Succes", description: "Evenement succesvol bijgewerkt" });
          dispatch(closeCreateModal());
          setEditingEvent(null);
          dispatch(fetchAllEvents());
        } else {
          toast({
            title: "Fout",
            description: res.payload?.message || "Fout bij het bijwerken van evenement",
            variant: "destructive",
          });
        }
      });
    },
    [dispatch, editingEvent, toast]
  );

  const handleDeleteEvent = useCallback(
    (event) => {
      dispatch(deleteCalendarEvent(event.id)).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          toast({ title: "Succes", description: "Evenement verwijderd" });
          dispatch(closeEventModal());
          dispatch(fetchAllEvents());
        } else {
          toast({
            title: "Fout",
            description: res.payload?.message || "Fout bij het verwijderen van evenement",
            variant: "destructive",
          });
        }
      });
    },
    [dispatch, toast]
  );

  const handleCloseCreateModal = useCallback(() => {
    dispatch(closeCreateModal());
    setPrefilledSlot(null);
    setEditingEvent(null);
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-dashboard-title">Kalender</h1>
      </div>

      {error && !dismissedError && (
        <div className="relative rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 pr-10 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => setDismissedError(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <CalendarHeader
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        onGoToDate={handleGoToDate}
      />

      {eventsLoading && events.length === 0 ? (
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
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        prefilledSlot={editingEvent ? editPrefilledSlot : prefilledSlot}
        prefilledTitle={editingEvent ? (editingEvent.summary || editingEvent.title) : undefined}
        prefilledDescription={editingEvent ? (editingEvent.description || "") : undefined}
        loading={creatingLoading || updatingLoading}
        isEditing={!!editingEvent}
      />

      <EventDetailsModal
        open={isEventModalOpen}
        onClose={() => dispatch(closeEventModal())}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        deleting={deletingLoading}
      />

      <button
        onClick={() => {
          setPrefilledSlot(null);
          setEditingEvent(null);
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
