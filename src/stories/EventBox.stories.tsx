import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import EventBox from '../components/EventBox';
import { Stack } from '@mui/material';

const meta = {
  title: 'EventBox',
  component: EventBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isNotifiedEvent: {
      control: 'boolean',
      description: '알림 이벤트 여부',
    },
  },
  args: {
    event: {
      id: '1',
      title: '기본 이벤트',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 설명',
      location: '서울시 강남구',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    isNotifiedEvent: false,
    handleEditEvent: fn(),
    handleDeleteEvent: fn(),
  },

  decorators: [
    (Story) => (
      <Stack width={400}>
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof EventBox>;

export default meta;

type Story = StoryObj<typeof EventBox>;

export const Default: Story = {
  args: {},
};

export const NotifiedEvent: Story = {
  args: {
    isNotifiedEvent: true,
    event: {
      id: '2',
      title: '알림이 온 이벤트',
      date: '2025-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '중요한 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  },
};

export const DailyRepeatEvent: Story = {
  args: {
    event: {
      id: '3',
      title: '매일 반복 이벤트',
      date: '2025-10-01',
      startTime: '08:00',
      endTime: '09:00',
      description: '아침 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 10,
    },
  },
};

export const WeeklyRepeatEvent: Story = {
  args: {
    event: {
      id: '4',
      title: '주간 회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 주간 회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 30,
    },
  },
};

export const MonthlyRepeatEvent: Story = {
  args: {
    event: {
      id: '5',
      title: '월간 보고',
      date: '2025-10-01',
      startTime: '15:00',
      endTime: '17:00',
      description: '월간 실적 보고',
      location: '본사 대회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 60,
    },
  },
};

export const YearlyRepeatEvent: Story = {
  args: {
    event: {
      id: '6',
      title: '생일',
      date: '2025-10-01',
      startTime: '00:00',
      endTime: '23:59',
      description: '생일 축하',
      location: '집',
      category: '개인',
      repeat: { type: 'yearly', interval: 1 },
      notificationTime: 1440,
    },
  },
};

export const RepeatEventWithEndDate: Story = {
  args: {
    event: {
      id: '7',
      title: '종료일이 있는 반복 이벤트',
      date: '2025-10-01',
      startTime: '13:00',
      endTime: '14:00',
      description: '프로젝트 정기 회의',
      location: '회의실 C',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 2,
        endDate: '2025-12-31',
      },
      notificationTime: 10,
    },
  },
};

export const NotifiedRepeatEvent: Story = {
  args: {
    isNotifiedEvent: true,
    event: {
      id: '8',
      title: '알림이 온 반복 이벤트',
      date: '2025-10-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '매일 아침 스탠드업 미팅',
      location: '온라인',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 10,
    },
  },
};
