import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatDate, formatWeek, getWeekDates } from '../utils/dateUtils';
import { Event } from '../types.ts';
import CalendarCell from './CalendarCell';

const WeekView = ({
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
}) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatWeek(currentDate)}</Typography>
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
            <TableRow>
              {weekDates.map((date) => {
                const dateString = formatDate(currentDate, date.getDate());
                const events = filteredEvents.filter(
                  (event) => new Date(event.date).toDateString() === date.toDateString()
                );

                return (
                  <CalendarCell
                    key={date.toISOString()}
                    day={date.getDate()}
                    dateString={dateString}
                    selectedDate={selectedDate}
                    events={events}
                    notifiedEvents={notifiedEvents}
                    draggedEvent={draggedEvent}
                    handleDateCellClick={handleDateCellClick}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                  />
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default WeekView;
