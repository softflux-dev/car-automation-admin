import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lightboxItem: null,
  sidebarOpen: true,
  activeCarouselIndex: 0,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openLightbox: (state, action) => {
      state.lightboxItem = action.payload;
    },
    closeLightbox: (state) => {
      state.lightboxItem = null;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveCarouselIndex: (state, action) => {
      state.activeCarouselIndex = action.payload;
    },
  },
});

export const {
  openLightbox,
  closeLightbox,
  toggleSidebar,
  setActiveCarouselIndex,
} = uiSlice.actions;
export default uiSlice.reducer;
