import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import OverlappingConfirmDialog from '../components/OverlappingConfirmDialog';

const meta = {
  title: 'OverlappingConfirmDialog',
  component: OverlappingConfirmDialog,
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
    overlappingEvents: [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    onClose: fn(),
    handleOverlapConfirmAction: fn(),
  },
} satisfies Meta<typeof OverlappingConfirmDialog>;

export default meta;

type Story = StoryObj<typeof OverlappingConfirmDialog>;

export const SingleOverlap: Story = {
  args: {},
};

export const MultipleOverlaps: Story = {
  args: {
    overlappingEvents: [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '고객 미팅',
        date: '2025-10-01',
        startTime: '10:30',
        endTime: '11:30',
        description: '고객사 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-10-01',
        startTime: '10:45',
        endTime: '12:00',
        description: '동료와 점심',
        location: '레스토랑',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

export const RepeatingEventOverlap: Story = {
  args: {
    overlappingEvents: [
      {
        id: '1',
        title: '매일 아침 운동',
        date: '2025-10-01',
        startTime: '08:00',
        endTime: '09:00',
        description: '매일 아침 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '주간 스탠드업',
        date: '2025-10-01',
        startTime: '08:30',
        endTime: '09:00',
        description: '매주 월요일 스탠드업',
        location: '온라인',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ],
  },
};

export const LongTitleOverlap: Story = {
  args: {
    overlappingEvents: [
      {
        id: '1',
        title:
          '매우 긴 제목을 가진 일정입니다. 이 일정은 정말로 긴 제목을 가지고 있어서 어떻게 표시되는지 확인해야 합니다.',
        date: '2025-10-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '긴 제목 테스트',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
