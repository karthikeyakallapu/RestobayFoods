import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import useTableStore from "../../store/use-table";

import {
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
  Paper,
} from "@mui/material";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PlaceIcon from "@mui/icons-material/Place";

import Toast from "../../_components/Toasts/Toast";
import restoApiInstance from "../../service/api/api";
import useModalStore from "../../store/use-modal";

import dayjs from "dayjs";

const Tables = () => {
  const {
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    partySize,
    setPartySize,
    availableTables,
    setAvailableTables,
    isLoading,
    setIsLoading,
    searchInitiated,
    setSearchInitiated,
    setSelectedTable,
  } = useTableStore();

  const { openModal } = useModalStore();

  const checkAvailability = async () => {
    if (!date || !startTime || !endTime) {
      Toast({
        type: "error",
        message: "Please select date, start time and end time",
      });
      return;
    }

    if (dayjs(endTime).isBefore(dayjs(startTime))) {
      Toast({
        type: "error",
        message: "End time must be after start time",
      });
      return;
    }

    setIsLoading(true);
    setSearchInitiated(true);

    const data = {
      bookingDate: dayjs(date).format("YYYY-MM-DD"),
      startTime: dayjs(startTime).format("HH:mm"),
      endTime: dayjs(endTime).format("HH:mm"),
      partySize,
    };

    try {
      const response = await restoApiInstance.checkTableAvailability(data);

      setAvailableTables(response.tables || []);

      Toast({
        type: response.type,
        message: response.message,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailableTables([]);
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BlockWrapper>
        <h2 className="anton tracking-wide text-3xl text-center text-[#ef5644]">
          Reserve a Table
        </h2>

        <Box className="p-6">
          <Box className="max-w-2xl mx-auto">
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" fontFamily={"Kanit"}>
                Find Available Tables
              </Typography>

              {/* DATE + PARTY SIZE */}

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
                <Box>
                  <Typography variant="subtitle2">Date</Typography>

                  <DatePicker
                    value={date}
                    disablePast
                    onChange={(newValue) => setDate(newValue)}
                    sx={{ width: "100%" }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2">Number of People</Typography>

                  <FormControl fullWidth>
                    <Select
                      value={partySize}
                      onChange={(e) => setPartySize(parseInt(e.target.value))}
                      renderValue={(selected) => (
                        <Box display="flex" alignItems="center">
                          <PeopleAltIcon sx={{ color: "#ef5644", mr: 1 }} />
                          {selected} people
                        </Box>
                      )}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} people
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* START + END TIME */}

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Box>
                  <Typography variant="subtitle2">Start Time</Typography>

                  <TimePicker
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    sx={{ width: "100%" }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2">End Time</Typography>

                  <TimePicker
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    sx={{ width: "100%" }}
                  />
                </Box>
              </Box>

              <button
                onClick={checkAvailability}
                disabled={isLoading}
                className="w-full bg-[#ef5644] text-white py-2 rounded-md"
              >
                {isLoading
                  ? "Checking Availability..."
                  : "Check Available Tables"}
              </button>
            </Paper>

            {/* RESULTS */}

            {searchInitiated && (
              <Box className="mt-8">
                <Typography variant="h5">
                  {isLoading
                    ? "Searching..."
                    : availableTables?.length > 0
                      ? "Available Tables"
                      : "No Tables Available"}
                </Typography>

                <Box className="space-y-4 mt-4">
                  {availableTables?.map((table) => (
                    <Paper key={table.id} sx={{ p: 3 }}>
                      <Box className="flex justify-between items-center">
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TableRestaurantIcon sx={{ color: "#ef5644" }} />
                            <Typography variant="h6">
                              {table.table_number}
                            </Typography>
                          </Box>

                          <Box display="flex" gap={3} mt={1}>
                            <Box display="flex" alignItems="center">
                              <PeopleAltIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">
                                Capacity: {table.capacity}
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="center">
                              <PlaceIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">
                                {table.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <button
                          className="bg-[#ef5644] text-white py-2 px-6 rounded-md"
                          onClick={() => {
                            document.activeElement?.blur();
                            setSelectedTable(table.table_number);
                            useTableStore.getState().setTableId(table.id);
                            openModal("table");
                          }}
                        >
                          Reserve
                        </button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </BlockWrapper>
    </LocalizationProvider>
  );
};

export default Tables;
