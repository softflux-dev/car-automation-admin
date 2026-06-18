import Api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";

const extractArray = (body) => {
  if (Array.isArray(body)) return body;
  if (body?.data && Array.isArray(body.data)) return body.data;
  if (body?.events && Array.isArray(body.events)) return body.events;
  return [];
};

export const getAllEvents = () =>
  Api.get(ENDPOINTS.googleCalendar.getAllEvents).then((res) =>
    extractArray(res.data)
  );

export const createEvent = (payload) =>
  Api.post(ENDPOINTS.googleCalendar.createEvents, payload).then(
    (res) => res.data
  );

export const updateEvent = (id, payload) =>
  Api.put(
    ENDPOINTS.googleCalendar.updateEvent.replace(":eventId", id),
    payload
  ).then((res) => res.data);

export const deleteEvent = (id) =>
  Api.delete(
    ENDPOINTS.googleCalendar.deleteEvent.replace(":eventId", id)
  ).then((res) => res.data);
