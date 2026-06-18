import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllEvents, createEvent, updateEvent, deleteEvent } from "../services/calendarService";

export const fetchAllEvents = createAsyncThunk(
  "calendar/fetchAllEvents",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllEvents();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Fout bij het laden van evenementen" });
    }
  }
);

export const createCalendarEvent = createAsyncThunk(
  "calendar/createCalendarEvent",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createEvent(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Fout bij het aanmaken van evenement" });
    }
  }
);

export const updateCalendarEvent = createAsyncThunk(
  "calendar/updateCalendarEvent",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const data = await updateEvent(id, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Fout bij het bijwerken van evenement" });
    }
  }
);

export const deleteCalendarEvent = createAsyncThunk(
  "calendar/deleteCalendarEvent",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEvent(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Fout bij het verwijderen van evenement" });
    }
  }
);

export const createCalendarEventFromInquiry = createAsyncThunk(
  "calendar/createCalendarEventFromInquiry",
  async ({ inquiry, summary, description, startDateTime, endDateTime }, { rejectWithValue }) => {
    try {
      const payload = { inquiryId: inquiry._id, summary, description, startDateTime, endDateTime };
      const data = await createEvent(payload);
      return { inquiryId: inquiry._id, data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Fout bij toevoegen aan agenda" });
    }
  }
);
