import { test, expect } from '@playwright/test';

test('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async ({
  page,
}) => {
  //일정생성
  await page.goto('http://localhost:5173/');

  await page.getByRole('textbox', { name: '제목' }).click();
  await page.getByRole('textbox', { name: '제목' }).fill('테스트 일정1');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-27');
  await page.getByRole('textbox', { name: '시작 시간' }).click();
  await page.getByRole('textbox', { name: '시작 시간' }).press('ArrowUp');
  await page.getByRole('textbox', { name: '종료 시간' }).press('Tab');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
  await page.getByRole('textbox', { name: '종료 시간' }).click();
  await page.getByRole('textbox', { name: '종료 시간' }).press('ArrowUp');
  await page.getByRole('textbox', { name: '종료 시간' }).press('Tab');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
  await page.getByRole('textbox', { name: '설명' }).click();
  await page.getByRole('textbox', { name: '설명' }).fill('테스트 설명1');
  await page.getByRole('textbox', { name: '위치' }).click();
  await page.getByRole('textbox', { name: '위치' }).fill('테스트 위치1');
  await page.getByRole('combobox', { name: '업무' }).click();
  await page.getByRole('option', { name: '개인-option' }).click();
  await page.getByTestId('event-submit-button').click();

  const eventList = page.getByTestId('event-list');
  expect(eventList.getByText('테스트 일정1')).toBeVisible();
  expect(eventList.getByText('2025-11-27')).toBeVisible();
  expect(eventList.getByText('10:00 - 11:00')).toBeVisible();
  expect(eventList.getByText('테스트 설명1')).toBeVisible();
  expect(eventList.getByText('테스트 위치1')).toBeVisible();
  expect(eventList.getByText('카테고리: 개인')).toBeVisible();
});

test('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
  //   const { user } = setup(<App />);
  //   setupMockHandlerUpdating();
  //   await user.click(await screen.findByLabelText('Edit event'));
  //   await user.clear(screen.getByLabelText('제목'));
  //   await user.type(screen.getByLabelText('제목'), '수정된 회의');
  //   await user.clear(screen.getByLabelText('설명'));
  //   await user.type(screen.getByLabelText('설명'), '회의 내용 변경');
  //   await user.click(screen.getByTestId('event-submit-button'));
  //   const eventList = within(screen.getByTestId('event-list'));
  //   expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
  //   expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
});

test('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
  //   setupMockHandlerDeletion();
  //   const { user } = setup(<App />);
  //   const eventList = within(screen.getByTestId('event-list'));
  //   expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();
  //   // 삭제 버튼 클릭
  //   const allDeleteButton = await screen.findAllByLabelText('Delete event');
  //   await user.click(allDeleteButton[0]);
  //   expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  // });
});

test('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
  //   // ! 현재 시스템 시간 2025-10-01
  //   const { user } = setup(<App />);
  //   await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
  //   await user.click(screen.getByRole('option', { name: 'week-option' }));
  //   // ! 일정 로딩 완료 후 테스트
  //   await screen.findByText('일정 로딩 완료!');
  //   const eventList = within(screen.getByTestId('event-list'));
  //   expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
});

test('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
  //   setupMockHandlerCreation();
  //   const { user } = setup(<App />);
  //   await saveSchedule(user, {
  //     title: '이번주 팀 회의',
  //     date: '2025-10-02',
  //     startTime: '09:00',
  //     endTime: '10:00',
  //     description: '이번주 팀 회의입니다.',
  //     location: '회의실 A',
  //     category: '업무',
  //   });
  //   await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
  //   await user.click(screen.getByRole('option', { name: 'week-option' }));
  //   const weekView = within(screen.getByTestId('week-view'));
  //   expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
});

test('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
  //   vi.setSystemTime(new Date('2025-01-01'));
  //   setup(<App />);
  //   // ! 일정 로딩 완료 후 테스트
  //   await screen.findByText('일정 로딩 완료!');
  //   const eventList = within(screen.getByTestId('event-list'));
  //   expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
});

test('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
  //   setupMockHandlerCreation();
  //   const { user } = setup(<App />);
  //   await saveSchedule(user, {
  //     title: '이번달 팀 회의',
  //     date: '2025-10-02',
  //     startTime: '09:00',
  //     endTime: '10:00',
  //     description: '이번달 팀 회의입니다.',
  //     location: '회의실 A',
  //     category: '업무',
  //   });
  //   const monthView = within(screen.getByTestId('month-view'));
  //   expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
});

test('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
  //   vi.setSystemTime(new Date('2025-01-01'));
  //   setup(<App />);
  //   const monthView = screen.getByTestId('month-view');
  //   // 1월 1일 셀 확인
  //   const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
  //   expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
});
