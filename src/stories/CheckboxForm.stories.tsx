import { Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import CheckboxForm from '../components/CheckboxForm';

const meta = {
  title: 'CheckboxForm',
  component: CheckboxForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: '체크박스 선택 여부',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width 여부',
    },
  },
  args: {
    checked: false,
    onChange: fn(),
    label: '반복 일정',
    fullWidth: false,
  },
  decorators: [
    (Story) => (
      <Stack width={400}>
        <Story />
      </Stack>
    ),
  ],
} satisfies Meta<typeof CheckboxForm>;

export default meta;

type Story = StoryObj<typeof CheckboxForm>;

export const Unchecked: Story = {
  args: {
    checked: false,
    label: '반복 일정',
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    label: '반복 일정',
  },
};

export const LongLabel: Story = {
  args: {
    checked: false,
    label:
      '이것은 매우 긴 레이블을 가진 체크박스입니다. 긴 텍스트가 어떻게 표시되는지 확인해봅니다.',
  },
};
