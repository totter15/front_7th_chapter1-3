import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Typography, Stack, IconButton, Select, MenuItem } from '@mui/material';
import React from 'react';

import WeekView from './WeekView';
import { Event } from '../types.ts';
import MonthView from './MonthView';

const Calendar = ({
  view,
  setView,
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
  navigate,
  holidays,
}: {
  view: 'week' | 'month';
  setView: (_view: 'week' | 'month') => void;
  currentDate: Date;
  weekDays: string[];
  selectedDate: string;
  handleDateCellClick: (_dateString: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  draggedEvent: Event | null;
  handleDragStart: (_event: Event) => void;
  handleDragOver: (_e: React.DragEvent) => void;
  handleDrop: (_targetDate: string) => void;
  navigate: (_direction: 'prev' | 'next') => void;
  holidays: { [key: string]: string };
}) => {
  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">일정 보기</Typography>

      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
          <ChevronLeft />
        </IconButton>
        <Select
          size="small"
          aria-label="뷰 타입 선택"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <MenuItem value="week" aria-label="week-option">
            Week
          </MenuItem>
          <MenuItem value="month" aria-label="month-option">
            Month
          </MenuItem>
        </Select>
        <IconButton aria-label="Next" onClick={() => navigate('next')}>
          <ChevronRight />
        </IconButton>
      </Stack>

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          weekDays={weekDays}
          selectedDate={selectedDate}
          handleDateCellClick={handleDateCellClick}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          draggedEvent={draggedEvent}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          weekDays={weekDays}
          selectedDate={selectedDate}
          handleDateCellClick={handleDateCellClick}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          draggedEvent={draggedEvent}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          holidays={holidays}
        />
      )}
    </Stack>
  );
};

export default Calendar;
