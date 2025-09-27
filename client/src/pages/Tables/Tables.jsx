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
  Paper
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
    endTime,
    setEndTime,
    startTime,
    setStartTime,
    setPartySize,
    partySize,
    availableTables,
    setAvailableTables,
    isLoading,
    setIsLoading,
    searchInitiated,
    setSearchInitiated,
    setSelectedTable
  } = useTableStore();

  const { openModal } = useModalStore();

  // Check table availability
  const checkAvailability = async () => {
    setIsLoading(true);
    setSearchInitiated(true);

    const data = {
      bookingDate: dayjs(date).format("YYYY-MM-DD"),
      startTime: dayjs(startTime).format("HH:mm:ss"),
      endTime: dayjs(endTime).format("HH:mm:ss"),
      partySize: partySize
    };

    try {
      const response = await restoApiInstance.checkTableAvailability(data);
      setAvailableTables(response.tables);
      Toast({ type: response.type, message: response.message });
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
          <Box className="max-w-2xl mx-auto ">
            {/* Reservation Form */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(239, 86, 68, 0.1)"
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  position: "relative",
                  fontFamily: "Kanit",
                  letterSpacing: "-0.5px",
                  display: "inline-block",
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    width: "60%",
                    height: "3px",
                    bottom: "0px",
                    left: "0",
                    backgroundColor: "#ef5644",
                    borderRadius: "5px"
                  }
                }}
              >
                Find Available Tables
              </Typography>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-8">
                {/* Date Selection */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    component="label"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    sx={{
                      fontWeight: 600,
                      color: "var(--color-gray-700)"
                    }}
                  >
                    Date
                  </Typography>
                  <DatePicker
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    disablePast
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: "50px",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ef5644"
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ef5644"
                        }
                      }
                    }}
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        fullWidth: true
                      }
                    }}
                  />
                </Box>

                {/* Party Size */}
                <Box className="">
                  <Typography
                    variant="subtitle2"
                    component="label"
                    className="block text-sm font-medium text-gray-700  "
                    sx={{
                      fontWeight: 600,
                      color: "var(--color-gray-700)"
                    }}
                  >
                    Number of People
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      value={partySize}
                      onChange={(e) => setPartySize(parseInt(e.target.value))}
                      displayEmpty
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PeopleAltIcon
                            sx={{ color: "#ef5644", mr: 1, fontSize: 20 }}
                          />
                          <Typography>
                            {selected} {selected === 1 ? "person" : "people"}
                          </Typography>
                        </Box>
                      )}
                      sx={{
                        height: "50px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.23)"
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ef5644"
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ef5644"
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            "& .MuiMenuItem-root": {
                              py: 1
                            }
                          }
                        }
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem
                          key={num}
                          value={num}
                          sx={{
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <PeopleAltIcon
                            sx={{ color: "#777", mr: 1, fontSize: 18 }}
                          />
                          {num} {num === 1 ? "person" : "people"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Start Time */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    component="label"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    sx={{
                      fontWeight: 600,
                      color: "var(--color-gray-700)"
                    }}
                  >
                    Start Time
                  </Typography>
                  <TimePicker
                    value={startTime}
                    disablePast={
                      dayjs().format("YYYY-MM-DD") ===
                      dayjs(date).format("YYYY-MM-DD")
                    }
                    onChange={(newValue) => setStartTime(newValue)}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: "50px",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ef5644"
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ef5644"
                        }
                      }
                    }}
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        fullWidth: true
                      }
                    }}
                  />
                </Box>

                {/* End Time */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    component="label"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    sx={{
                      fontWeight: 600,
                      color: "var(--color-gray-700)"
                    }}
                  >
                    End Time
                  </Typography>
                  <TimePicker
                    value={endTime}
                    disablePast={
                      dayjs().format("YYYY-MM-DD") ===
                      dayjs(date).format("YYYY-MM-DD")
                    }
                    onChange={(newValue) => setEndTime(newValue)}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        height: "50px",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ef5644"
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ef5644"
                        }
                      }
                    }}
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        fullWidth: true
                      }
                    }}
                  />
                </Box>
              </Box>

              <button
                onClick={checkAvailability}
                disabled={isLoading}
                className="w-full bg-[#ef5644] hover:bg-[#d94535] text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 text-lg shadow-sm hover:shadow-md disabled:opacity-70"
              >
                {isLoading
                  ? "Checking Availability..."
                  : "Check Available Tables"}
              </button>
            </Paper>

            {/* Results Section */}
            {searchInitiated && (
              <Box className="mt-8">
                <Typography
                  variant="h5"
                  component="h2"
                  fontFamily={"Kanit"}
                  className="font-semibold mb-4 text-gray-800 "
                >
                  {isLoading
                    ? "Searching for tables..."
                    : availableTables?.length > 0
                    ? "Available Tables"
                    : "No Tables Available"}
                </Typography>

                {isLoading ? (
                  <Box className="flex justify-center items-center h-40">
                    <Box className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ef5644]"></Box>
                  </Box>
                ) : (
                  <Box className="space-y-4 h-96  mt-4 overflow-scroll custom-scrollbar">
                    {availableTables?.length > 0 ? (
                      availableTables.map((table) => (
                        <Paper
                          key={table.id}
                          elevation={1}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px solid rgba(0,0,0,0.08)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                            }
                          }}
                        >
                          <Box className="flex justify-between items-center">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1
                                }}
                              >
                                <TableRestaurantIcon
                                  sx={{ color: "#ef5644" }}
                                />
                                <Typography
                                  variant="h6"
                                  component="h3"
                                  className="font-semibold"
                                >
                                  {table.table_number}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3
                                }}
                              >
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <PeopleAltIcon
                                    sx={{
                                      fontSize: 16,
                                      color: "#666",
                                      mr: 0.5
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Capacity: {table.capacity} people
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <PlaceIcon
                                    sx={{
                                      fontSize: 16,
                                      color: "#666",
                                      mr: 0.5
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Location: {table.location}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <button
                              className="bg-[#ef5644] hover:bg-[#d94535] text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 shadow-sm hover:shadow-md"
                              onClick={() => {
                                setSelectedTable(table.table_number);
                                useTableStore.getState().setTableId(table.id);
                                openModal("table");
                              }}
                            >
                              Reserve
                            </button>
                          </Box>
                        </Paper>
                      ))
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          borderRadius: 2,
                          backgroundColor: "rgba(0,0,0,0.02)",
                          border: "1px dashed rgba(0,0,0,0.1)"
                        }}
                      >
                        <Box className="text-center">
                          <Typography
                            variant="body1"
                            className="text-gray-600 mb-2"
                          >
                            No tables available for the selected time and party
                            size.
                          </Typography>
                          <Typography variant="body2" className="text-gray-500">
                            Try adjusting your search criteria or selecting a
                            different date/time.
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </BlockWrapper>
    </LocalizationProvider>
  );
};

export default Tables;
