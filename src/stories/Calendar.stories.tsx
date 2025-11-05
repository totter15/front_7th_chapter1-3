import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Calendar from '../components/Calendar';

const meta = {
  title: 'Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    view: 'month',
    setView: fn(),
    currentDate: new Date('2025-10-01'),
    weekDays: ['일', '월', '화', '수', '목', '금', '토'],
    selectedDate: '',
    handleDateCellClick: fn(),
    filteredEvents: [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '이벤트 1 설명',
        location: '이벤트 1 위치',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
    draggedEvent: null,
    handleDragStart: fn(),
    handleDragOver: fn(),
    handleDrop: fn(),
    navigate: fn(),
    holidays: {},
  },
} satisfies Meta<typeof Calendar>;

export default meta;

export const MonthView: StoryObj<typeof Calendar> = {
  args: {
    view: 'month',
  },
};

export const WeekView: StoryObj<typeof Calendar> = {
  args: {
    view: 'week',
  },
};
