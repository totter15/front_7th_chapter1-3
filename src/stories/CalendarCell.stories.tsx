import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import CalendarCell from '../components/CalendarCell';
import { Table, TableBody, TableRow } from '@mui/material';

const meta = {
  title: 'CalendarCell',
  component: CalendarCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Table sx={{ width: '200px', tableLayout: 'fixed' }}>
        <TableBody>
          <TableRow>
            <Story />
          </TableRow>
        </TableBody>
      </Table>
    ),
  ],
  args: {
    day: 15,
    dateString: '2025-10-15',
    selectedDate: '',
    events: [],
    notifiedEvents: [],
    draggedEvent: null,
    handleDateCellClick: fn(),
    handleDragStart: fn(),
    handleDragOver: fn(),
    handleDrop: fn(),
  },
} satisfies Meta<typeof CalendarCell>;

export default meta;

type Story = StoryObj<typeof CalendarCell>;

export const NoEvents: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: [],
  },
};

export const SingleEvent: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

export const MultipleEvents: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: [
      {
        id: '1',
        title: '아침 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-10-15',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '프로젝트 발표',
        date: '2025-10-15',
        startTime: '15:00',
        endTime: '16:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

export const SelectedDate: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    selectedDate: '2025-10-15',
    events: [
      {
        id: '1',
        title: '회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

export const WithHoliday: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    holiday: '한글날',
    events: [
      {
        id: '1',
        title: '휴일 이벤트',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

export const NotifiedEvent: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: [
      {
        id: '1',
        title: '중요 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: ['1'],
  },
};

export const RepeatingEvent: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: [
      {
        id: '1',
        title: '매일 스탠드업',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '09:15',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ],
  },
};

export const DraggingEvent: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: [
      {
        id: '1',
        title: '이동 중인 이벤트',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    draggedEvent: {
      id: '1',
      title: '이동 중인 이벤트',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  },
};

export const LongTitleEvent: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: [
      {
        id: '1',
        title: '매우 긴 제목을 가진 이벤트입니다. 이 제목은 너무 길어서 한 줄에 표시되지 않습니다.',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

export const MixedEvents: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: [
      {
        id: '1',
        title: '일반 이벤트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '알림 이벤트',
        date: '2025-10-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '반복 이벤트',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: ['2'],
  },
};

export const ManyEvents: Story = {
  args: {
    day: 15,
    dateString: '2025-10-15',
    events: Array.from({ length: 8 }, (_, i) => ({
      id: `${i + 1}`,
      title: `이벤트 ${i + 1}`,
      date: '2025-10-15',
      startTime: `${String(9 + i).padStart(2, '0')}:00`,
      endTime: `${String(10 + i).padStart(2, '0')}:00`,
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    })),
  },
};
