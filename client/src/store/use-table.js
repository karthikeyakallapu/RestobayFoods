import { create } from "zustand";
import dayjs from "dayjs";

const combineDateTime = (date, time) => {
  // Merge the date part of `date` with hour & minute of `time`
  return dayjs(date)
    .hour(time.hour())
    .minute(time.minute())
    .second(0)
    .millisecond(0);
};

const useTableStore = create((set, get) => {
  const now = dayjs();

  // Define initial state for reset function
  const getInitialState = () => ({
    selectedTable: null,
    tableId: null,
    isLoading: false,
    searchInitiated: false,
    date: now,
    partySize: 2,
    startTime: now.add(1, "minute"),
    endTime: now.add(1, "hour"),
    availableTables: [],
    isLoaded: false,
    error: null,
    price: 0,
  });

  return {
    ...getInitialState(),

    // SETTERS
    setDate: (date) => set({ date }),
    setPartySize: (partySize) => set({ partySize }),
    setStartTime: (startTime) => set({ startTime }),
    setEndTime: (endTime) => set({ endTime }),
    setAvailableTables: (availableTables) => set({ availableTables }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsLoaded: (isLoaded) => set({ isLoaded }),
    setError: (error) => set({ error }),
    setSearchInitiated: (searchInitiated) => set({ searchInitiated }),
    setTableId: (tableId) => set({ tableId }),
    setSelectedTable: (selectedTable) => set({ selectedTable }),

    // RESET FUNCTION
    resetTable: () => {
      const initialState = getInitialState();
      set(initialState);
    },

    // COMPUTED
    getEndTime: () => {
      // Default 1 hour after startTime
      return combineDateTime(get().date, get().startTime).add(1, "hour");
    },

    getPrice: () => {
      const date = get().date;
      const start = combineDateTime(date, get().startTime);
      const end = combineDateTime(date, get().endTime);

      if (!end.isAfter(start)) return 0; // prevent negative durations

      const durationMinutes = end.diff(start, "minute");
      const durationHours = Math.ceil(durationMinutes / 60);

      console.log({ durationMinutes, durationHours });

      return durationHours * 100; // price per hour
    },

    getApiData: () => {
      const date = get().date;
      const start = combineDateTime(date, get().startTime);
      const end = combineDateTime(date, get().endTime);

      return {
        bookingDate: dayjs(date).format("YYYY-MM-DD"),
        startTime: start.format("HH:mm"),
        endTime: end.format("HH:mm"),
        partySize: get().partySize,
      };
    },
  };
});

export default useTableStore;
