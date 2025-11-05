import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RecurringEventDialog from '../components/RecurringEventDialog';

const meta = {
  title: 'RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '다이얼로그 열림 여부',
    },
    mode: {
      control: 'select',
      options: ['edit', 'delete'],
      description: '다이얼로그 모드 (수정/삭제)',
    },
  },
  args: {
    open: true,
    event: {
      id: '1',
      title: '주간 회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 10,
    },
    mode: 'edit',
    onClose: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof RecurringEventDialog>;

export default meta;

type Story = StoryObj<typeof RecurringEventDialog>;

export const EditMode: Story = {
  args: {
    mode: 'edit',
  },
};

export const DeleteMode: Story = {
  args: {
    mode: 'delete',
  },
};

export const DailyRepeatEvent: Story = {
  args: {
    mode: 'edit',
    event: {
      id: '2',
      title: '아침 운동',
      date: '2025-10-01',
      startTime: '07:00',
      endTime: '08:00',
      description: '매일 아침 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 10,
    },
  },
};

export const MonthlyRepeatEvent: Story = {
  args: {
    mode: 'delete',
    event: {
      id: '3',
      title: '월간 보고',
      date: '2025-10-01',
      startTime: '15:00',
      endTime: '17:00',
      description: '매월 실적 보고',
      location: '본사 대회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 60,
    },
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};

