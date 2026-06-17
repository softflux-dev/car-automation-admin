import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllEvents, createEvent } from "../services/calendarService";
import {
  setInquiryCalendarStatus,
  setAddingToCalendarLoading,
} from "@/store/slices/inquiriesSlice";
import { toast } from "@/hooks/use-toast";

export const fetchAllEvents = createAsyncThunk(
  "calendar/fetchAllEvents",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllEvents();
      return data;
    } catch (error) {
      toast({
        title: "Fout",
        description:
          error?.response?.data?.message ||
          "Fout bij het laden van evenementen",
        variant: "destructive",
      });
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createCalendarEvent = createAsyncThunk(
  "calendar/createCalendarEvent",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createEvent(payload);
      toast({
        title: "Succes",
        description: "Evenement succesvol aangemaakt",
      });
      return data;
    } catch (error) {
      toast({
        title: "Fout",
        description:
          error?.response?.data?.message ||
          "Fout bij het aanmaken van evenement",
        variant: "destructive",
      });
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createCalendarEventFromInquiry = createAsyncThunk(
  "calendar/createCalendarEventFromInquiry",
  async ({ inquiry, summary, description, startDateTime, endDateTime }, { dispatch, rejectWithValue }) => {
    const inquiryId = inquiry._id;
    dispatch(setAddingToCalendarLoading({ inquiryId, loading: true }));

    try {
      const payload = { inquiryId, summary, description, startDateTime, endDateTime };

      await createEvent(payload);

      dispatch(setInquiryCalendarStatus({ inquiryId, isAddedToCalendar: true }));

      toast({
        title: "Succes",
        description: "Toegevoegd aan Google Agenda",
      });

      return { inquiryId };
    } catch (error) {
      toast({
        title: "Fout",
        description:
          error?.response?.data?.message ||
          "Fout bij toevoegen aan agenda",
        variant: "destructive",
      });
      return rejectWithValue(error.response?.data);
    } finally {
      dispatch(setAddingToCalendarLoading({ inquiryId, loading: false }));
    }
  }
);