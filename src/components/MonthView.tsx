import { formatMonth, getWeeksAtMonth } from '../utils/dateUtils';
import {
  Stack,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { formatDate, getEventsForDay } from '../utils/dateUtils';
import { Event } from '../types';
import CalendarCell from './CalendarCell';

const MonthView = ({
  currentDate,
  weekDays,
  selectedDate,
  handleDateCellClick,
  filteredEvents,
  notifiedEvents,
  draggedEvent,
  handleDragStart,
  handleDragOver,
  handleDrop,
  holidays,
}: {
  currentDate: Date;
  weekDays: string[];
  selectedDate: string;
  handleDateCellClick: (dateString: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  draggedEvent: Event | null;
  handleDragStart: (event: Event) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (targetDate: string) => void;
  holidays: { [key: string]: string };
}) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatMonth(currentDate)}</Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const holiday = holidays[dateString];
                  const events = day ? getEventsForDay(filteredEvents, day) : [];

                  return (
                    <CalendarCell
                      key={dayIndex}
                      day={day}
                      dateString={dateString}
                      selectedDate={selectedDate}
                      events={events}
                      notifiedEvents={notifiedEvents}
                      draggedEvent={draggedEvent}
                      handleDateCellClick={handleDateCellClick}
                      handleDragStart={handleDragStart}
                      handleDragOver={handleDragOver}
                      handleDrop={handleDrop}
                      holiday={holiday}
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default MonthView;
