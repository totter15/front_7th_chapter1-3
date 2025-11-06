import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import DragAndDropConfirmDialog from '../components/DragAndDropConfirmDialog';

const meta = {
  title: 'DragAndDropConfirmDialog',
  component: DragAndDropConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '다이얼로그 열림 여부',
    },
  },
  args: {
    open: true,
    event: {
      id: '1',
      title: '팀 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    newDate: '2025-10-02',
    newStartTime: '14:00',
    newEndTime: '15:00',
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof DragAndDropConfirmDialog>;

export default meta;

type Story = StoryObj<typeof DragAndDropConfirmDialog>;

export const Default: Story = {
  args: {},
};

export const NormalEvent: Story = {
  args: {
    open: true,
    event: {
      id: '2',
      title: '점심 약속',
      date: '2025-10-05',
      startTime: '12:00',
      endTime: '13:00',
      description: '고객과의 점심 미팅',
      location: '레스토랑',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    newDate: '2025-10-06',
    newStartTime: '12:30',
    newEndTime: '13:30',
  },
};

export const RepeatingEventDaily: Story = {
  args: {
    open: true,
    event: {
      id: '3',
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
    newDate: '2025-10-02',
    newStartTime: '08:00',
    newEndTime: '09:00',
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
