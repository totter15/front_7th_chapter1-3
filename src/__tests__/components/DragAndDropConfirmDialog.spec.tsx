import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import DragAndDropConfirmDialog from '../../components/DragAndDropConfirmDialog';
import { Event } from '../../types';

const theme = createTheme();

const setup = (props: React.ComponentProps<typeof DragAndDropConfirmDialog>) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>{<DragAndDropConfirmDialog {...props} />}</ThemeProvider>
    ),
    user,
  };
};

describe('DragAndDropConfirmDialog 컴포넌트 테스트', () => {
  const mockEvent: Event = {
    id: '1',
    title: '테스트 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  describe('TC-C01: 드래그 앤 드롭 확인 다이얼로그 렌더링', () => {
    it('다이얼로그가 열리면 제목, 변경 전/후 정보, 저장/취소 버튼이 표시된다', () => {
      setup({
        open: true,
        event: mockEvent,
        newDate: '2025-10-16',
        newStartTime: '10:00',
        newEndTime: '11:00',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
      });

      // 다이얼로그 제목 확인
      expect(screen.getByText('일정 이동 확인')).toBeInTheDocument();

      // 일정 제목 표시
      expect(screen.getByText(/일정:.*테스트 회의/)).toBeInTheDocument();

      // 변경 전 정보 표시
      expect(screen.getByText(/변경 전:.*2025-10-15.*09:00.*10:00/)).toBeInTheDocument();

      // 변경 후 정보 표시
      expect(screen.getByText(/변경 후:.*2025-10-16.*10:00.*11:00/)).toBeInTheDocument();

      // 버튼 확인
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('다이얼로그가 닫혀있으면 내용이 표시되지 않는다', () => {
      setup({
        open: false,
        event: mockEvent,
        newDate: '2025-10-16',
        newStartTime: '10:00',
        newEndTime: '11:00',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
      });

      // 다이얼로그 내용이 보이지 않음
      expect(screen.queryByText('일정 이동 확인')).not.toBeInTheDocument();
    });

    it('저장 버튼을 클릭하면 onConfirm 콜백이 호출된다', async () => {
      const { user } = setup({
        open: true,
        event: mockEvent,
        newDate: '2025-10-16',
        newStartTime: '10:00',
        newEndTime: '11:00',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
      });

      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('취소 버튼을 클릭하면 onCancel 콜백이 호출된다', async () => {
      const { user } = setup({
        open: true,
        event: mockEvent,
        newDate: '2025-10-16',
        newStartTime: '10:00',
        newEndTime: '11:00',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
      });

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('TC-C02: 반복 일정 변환 안내 메시지 표시', () => {
    it('반복 일정을 드래그하면 단일 일정으로 변환된다는 안내 메시지가 표시된다', () => {
      const repeatEvent: Event = {
        ...mockEvent,
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-20', id: 'repeat-1' },
      };

      setup({
        open: true,
        event: repeatEvent,
        newDate: '2025-10-16',
        newStartTime: '10:00',
        newEndTime: '11:00',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
      });

      // 반복 일정 변환 안내 메시지 확인
      expect(screen.getByText(/반복 일정이 단일 일정으로 변환됩니다/)).toBeInTheDocument();
    });

    it('일반 일정(반복 없음)을 드래그하면 안내 메시지가 표시되지 않는다', () => {
      setup({
        open: true,
        event: mockEvent,
        newDate: '2025-10-16',
        newStartTime: '10:00',
        newEndTime: '11:00',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
      });

      // 반복 일정 안내 메시지가 없음
      expect(screen.queryByText(/반복 일정이 단일 일정으로 변환됩니다/)).not.toBeInTheDocument();
    });
  });
});

