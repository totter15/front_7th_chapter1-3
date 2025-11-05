import { Notifications, Repeat } from '@mui/icons-material';
import { Box, Stack, TableCell, Tooltip, Typography } from '@mui/material';
import { Event, RepeatType } from '../types';

interface CalendarCellProps {
  day: number | null;
  dateString: string;
  selectedDate: string;
  events: Event[];
  notifiedEvents: string[];
  draggedEvent: Event | null;
  handleDateCellClick: (dateString: string) => void;
  handleDragStart: (event: Event) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (targetDate: string) => void;
  holiday?: string;
}

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

const CalendarCell = ({
  day,
  dateString,
  selectedDate,
  events,
  notifiedEvents,
  draggedEvent,
  handleDateCellClick,
  handleDragStart,
  handleDragOver,
  handleDrop,
  holiday,
}: CalendarCellProps) => {
  return (
    <TableCell
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
        backgroundColor: dateString && selectedDate === dateString ? '#e3f2fd' : undefined,
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
          {events.map((event) => {
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
                  {isRepeating && (
                    <Tooltip
                      title={`${event.repeat.interval}${getRepeatTypeLabel(
                        event.repeat.type
                      )}마다 반복${event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''}`}
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
};

export default CalendarCell;
