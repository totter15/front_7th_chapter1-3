import { Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import InputForm from '../components/InputForm';

const meta = {
  title: 'InputForm',
  component: InputForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'date', 'time'],
      description: 'Input 타입',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width 여부',
    },
  },
  args: {
    id: 'input-field',
    label: '제목',
    value: '',
    onChange: fn(),
    onBlur: fn(),
    type: 'text',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <Stack width={400}>
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof InputForm>;

export default meta;

type Story = StoryObj<typeof InputForm>;

export const TextInput: Story = {
  args: {
    id: 'title',
    label: '제목',
    value: '팀 회의',
    type: 'text',
  },
};

export const EmptyTextInput: Story = {
  args: {
    id: 'description',
    label: '설명',
    value: '',
    type: 'text',
  },
};

export const DateInput: Story = {
  args: {
    id: 'date',
    label: '날짜',
    value: '2025-10-01',
    type: 'date',
  },
};

export const TimeInput: Story = {
  args: {
    id: 'start-time',
    label: '시작 시간',
    value: '09:00',
    type: 'time',
  },
};

export const WithStringError: Story = {
  args: {
    id: 'end-time',
    label: '종료 시간',
    value: '08:00',
    type: 'time',
    error: '종료 시간은 시작 시간보다 늦어야 합니다',
  },
};

export const WithBooleanError: Story = {
  args: {
    id: 'title',
    label: '제목',
    value: '',
    type: 'text',
    error: true,
  },
};
