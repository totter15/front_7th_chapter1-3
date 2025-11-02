import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';

import { setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('드래그 앤 드롭 워크플로우 통합 테스트', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('SC-02: 일반 일정 드래그 앤 드롭 후 확인 다이얼로그 표시 및 저장 동작 검증', () => {
    it('TC-I01: 일반 일정을 드래그하여 다른 날짜로 이동하고 저장하면 일정이 새 날짜에 표시된다', async () => {
      const initialEvents: Event[] = [
        {
          id: '1',
          title: '이동할 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '프로젝트 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      setupMockHandlerUpdating(initialEvents);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 일정이 표시되는지 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('이동할 회의')).toBeInTheDocument();

      // 캘린더에서 드래그 가능한 일정 요소 찾기
      // 실제 구현에서는 draggable 속성이나 data-event-id를 가진 요소로 작성될 것
      const eventElement = screen.getByTestId('draggable-event-1');

      // 드래그 시작
      fireEvent.dragStart(eventElement);

      // 드래그 중 시각적 피드백 확인 (구현 시 추가될 속성)
      expect(eventElement).toHaveAttribute('data-dragging', 'true');

      // 드롭 타겟 셀 찾기 (구현 시 추가될 data-testid)
      const targetDateCell = screen.getByTestId('drop-target-2025-10-16');

      // 드롭
      fireEvent.drop(targetDateCell);

      // 확인 다이얼로그가 표시되는지 확인
      expect(await screen.findByText('일정 이동 확인')).toBeInTheDocument();
      expect(screen.getByText(/2025-10-15/)).toBeInTheDocument();
      expect(screen.getByText(/2025-10-16/)).toBeInTheDocument();

      // 저장 버튼 클릭
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);

      // 성공 토스트 확인
      expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

      // 일정이 새 날짜에 표시되는지 확인
      const updatedEventList = within(screen.getByTestId('event-list'));
      expect(updatedEventList.getByText('이동할 회의')).toBeInTheDocument();
      expect(updatedEventList.getByText('2025-10-16')).toBeInTheDocument();
    });
  });

  describe('SC-03: 확인 다이얼로그에서 취소 시 변경 되돌림 검증', () => {
    it('TC-I02: 드래그 앤 드롭 후 취소를 선택하면 일정이 원래 위치에 유지된다', async () => {
      const initialEvents: Event[] = [
        {
          id: '1',
          title: '취소 테스트 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '테스트',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      setupMockHandlerUpdating(initialEvents);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 일정 드래그 앤 드롭
      const eventElement = screen.getByTestId('draggable-event-1');
      fireEvent.dragStart(eventElement);

      const targetDateCell = screen.getByTestId('drop-target-2025-10-16');
      fireEvent.drop(targetDateCell);

      // 확인 다이얼로그에서 취소 클릭
      const cancelButton = await screen.findByRole('button', { name: '취소' });
      await user.click(cancelButton);

      // 다이얼로그가 닫히는지 확인
      expect(screen.queryByText('일정 이동 확인')).not.toBeInTheDocument();

      // 일정이 원래 날짜에 유지되는지 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('취소 테스트 회의')).toBeInTheDocument();
      expect(eventList.getByText('2025-10-15')).toBeInTheDocument();

      // API 호출이 없었는지 확인 (토스트 메시지가 표시되지 않음)
      expect(screen.queryByText('일정이 수정되었습니다.')).not.toBeInTheDocument();
    });
  });

  describe('SC-04: 반복 일정 드래그 앤 드롭 시 반복 제외 및 단일 일정 변환 검증', () => {
    it('TC-I03: 반복 일정을 드래그하면 단일 일정으로 변환된다는 안내가 표시되고 저장 후 단일 일정으로 변경된다', async () => {
      const initialEvents: Event[] = [
        {
          id: '1',
          title: '반복 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-20', id: 'repeat-1' },
          notificationTime: 10,
        },
      ];

      setupMockHandlerUpdating(initialEvents);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 반복 일정 드래그 앤 드롭
      const eventElement = screen.getByTestId('draggable-event-1');
      fireEvent.dragStart(eventElement);

      const targetDateCell = screen.getByTestId('drop-target-2025-10-16');
      fireEvent.drop(targetDateCell);

      // 확인 다이얼로그에 반복 일정 변환 안내 표시
      expect(await screen.findByText('일정 이동 확인')).toBeInTheDocument();
      expect(screen.getByText(/반복 일정이 단일 일정으로 변환됩니다/)).toBeInTheDocument();

      // 저장 버튼 클릭
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);

      // 성공 토스트 확인
      expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

      // 일정이 단일 일정으로 변경되었는지 확인 (반복 아이콘이 사라짐)
      const eventList = within(screen.getByTestId('event-list'));
      const eventRow = eventList.getByText('반복 회의').closest('tr');
      expect(within(eventRow!).queryByTestId('RepeatIcon')).not.toBeInTheDocument();
    });
  });

  describe('SC-05: 드래그 앤 드롭 후 일정 겹침 발생 시 경고 다이얼로그 표시 검증', () => {
    it('TC-I04: 드래그 앤 드롭 후 일정 겹침이 발생하면 경고 다이얼로그가 표시된다', async () => {
      const initialEvents: Event[] = [
        {
          id: '1',
          title: '이동할 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '회의 A',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '기존 회의',
          date: '2025-10-16',
          startTime: '09:30',
          endTime: '10:30',
          description: '회의 B',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      setupMockHandlerUpdating(initialEvents);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 일정 드래그 앤 드롭 (겹치는 시간으로)
      const eventElement = screen.getByTestId('draggable-event-1');
      fireEvent.dragStart(eventElement);

      const targetDateCell = screen.getByTestId('drop-target-2025-10-16');
      fireEvent.drop(targetDateCell);

      // 이동 확인 다이얼로그에서 저장
      const saveButton = await screen.findByRole('button', { name: '저장' });
      await user.click(saveButton);

      // 겹침 경고 다이얼로그 확인
      expect(await screen.findByText(/일정이 겹칩니다/)).toBeInTheDocument();

      // 계속 버튼 클릭
      const continueButton = screen.getByRole('button', { name: '계속' });
      await user.click(continueButton);

      // 저장 성공 토스트 확인
      expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();
    });
  });

  describe('SC-01: 드래그 시작 시 시각적 피드백 제공 확인', () => {
    it('TC-I05: 드래그 중인 일정이 시각적 피드백을 제공한다', async () => {
      const initialEvents: Event[] = [
        {
          id: '1',
          title: '드래그 테스트',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '테스트',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      setupMockHandlerUpdating(initialEvents);

      setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 일정 요소 찾기
      const eventElement = screen.getByTestId('draggable-event-1');

      // 드래그 시작
      fireEvent.dragStart(eventElement);

      // 드래그 중 시각적 피드백 확인 (data-dragging 속성 또는 특정 클래스)
      expect(eventElement).toHaveAttribute('data-dragging', 'true');
      // 또는 스타일 클래스 확인
      // expect(eventElement).toHaveClass('dragging');
    });
  });

  describe('SC-07: 네트워크 오류 시 에러 처리 검증', () => {
    it('드래그 앤 드롭 저장 시 네트워크 오류가 발생하면 에러 토스트가 표시된다', async () => {
      const initialEvents: Event[] = [
        {
          id: '1',
          title: '오류 테스트',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '테스트',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      setupMockHandlerUpdating(initialEvents);

      // 네트워크 오류 설정
      server.use(http.put('/api/events/:id', () => new HttpResponse(null, { status: 500 })));

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 일정 드래그 앤 드롭
      const eventElement = screen.getByTestId('draggable-event-1');
      fireEvent.dragStart(eventElement);

      const targetDateCell = screen.getByTestId('drop-target-2025-10-16');
      fireEvent.drop(targetDateCell);

      // 저장 버튼 클릭
      const saveButton = await screen.findByRole('button', { name: '저장' });
      await user.click(saveButton);

      // 에러 토스트 확인
      expect(await screen.findByText('일정 수정 실패')).toBeInTheDocument();

      // 일정이 원래 위치에 유지되는지 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    });
  });
});
