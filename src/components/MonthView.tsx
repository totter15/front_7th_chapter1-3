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
  Tooltip,
  Box,
} from '@mui/material';
import { Notifications, Repeat } from '@mui/icons-material';
import { formatDate, getEventsForDay } from '../utils/dateUtils';
import { Event, RepeatType } from '../types';

const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

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

                  return (
                    <TableCell
                      key={dayIndex}
                      data-testid={dateString ? `drop-target-${dateString}` : undefined}
                      data-selected={dateString && selectedDate === dateString ? 'true' : undefined}
                      onDragOver={dateString ? handleDragOver : undefined}
                      onDrop={dateString ? () => handleDrop(dateString) : undefined}
                      onClick={dateString ? () => handleDateCellClick(dateString) : undefined}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor:
                          dateString && selectedDate === dateString ? '#e3f2fd' : undefined,
                        cursor: dateString ? 'pointer' : undefined,
                      }}
                    >
                      {day && (
                        <>
                          <Typography variant="body2" fontWeight="bold">
                            {day}
                          </Typography>
                          {holiday && (
                            <Typography variant="body2" color="error">
                              {holiday}
                            </Typography>
                          )}
                          {getEventsForDay(filteredEvents, day).map((event) => {
                            const isNotified = notifiedEvents.includes(event.id);
                            const isRepeating = event.repeat.type !== 'none';

                            return (
                              <Box
                                key={event.id}
                                draggable
                                data-testid={`draggable-event-${event.id}`}
                                data-dragging={draggedEvent?.id === event.id ? 'true' : undefined}
                                onDragStart={() => handleDragStart(event)}
                                sx={{
                                  p: 0.5,
                                  my: 0.5,
                                  backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                                  borderRadius: 1,
                                  fontWeight: isNotified ? 'bold' : 'normal',
                                  color: isNotified ? '#d32f2f' : 'inherit',
                                  minHeight: '18px',
                                  width: '100%',
                                  overflow: 'hidden',
                                  cursor: 'move',
                                  opacity: draggedEvent?.id === event.id ? 0.5 : 1,
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {isNotified && <Notifications fontSize="small" />}
                                  {/* ! TEST CASE */}
                                  {isRepeating && (
                                    <Tooltip
                                      title={`${event.repeat.interval}${getRepeatTypeLabel(
                                        event.repeat.type
                                      )}마다 반복${
                                        event.repeat.endDate
                                          ? ` (종료: ${event.repeat.endDate})`
                                          : ''
                                      }`}
                                    >
                                      <Repeat fontSize="small" />
                                    </Tooltip>
                                  )}
                                  <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                  >
                                    {event.title}
                                  </Typography>
                                </Stack>
                              </Box>
                            );
                          })}
                        </>
                      )}
                    </TableCell>
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
