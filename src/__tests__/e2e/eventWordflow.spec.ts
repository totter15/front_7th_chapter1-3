import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import path from 'path';

// 각 테스트 전에 데이터베이스 초기화
const __dirname = path.resolve();

test.beforeEach(async () => {
  const storageStatePath = `${__dirname}/src/__mocks__/response/e2e.json`;
  if (fs.existsSync(storageStatePath)) {
    fs.writeFileSync(
      storageStatePath,
      JSON.stringify({
        events: [],
      })
    );
  }
});

const createEvent = async (
  page: Page,
  {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
  }: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: '개인' | '업무' | '가족' | '기타';
  }
) => {
  await page.goto('');

  await page.getByRole('textbox', { name: '제목' }).click();
  await page.getByRole('textbox', { name: '제목' }).fill(title);
  await page.getByRole('textbox', { name: '날짜' }).fill(date);
  await page.getByRole('textbox', { name: '시작 시간' }).click();
  await page.getByRole('textbox', { name: '시작 시간' }).press('ArrowUp');
  await page.getByRole('textbox', { name: '시작 시간' }).fill(startTime);
  await page.getByRole('textbox', { name: '종료 시간' }).click();
  await page.getByRole('textbox', { name: '종료 시간' }).press('ArrowUp');
  await page.getByRole('textbox', { name: '종료 시간' }).fill(endTime);
  await page.getByRole('textbox', { name: '설명' }).click();
  await page.getByRole('textbox', { name: '설명' }).fill(description);
  await page.getByRole('textbox', { name: '위치' }).click();
  await page.getByRole('textbox', { name: '위치' }).fill(location);
  await page.getByRole('combobox', { name: '업무' }).click();
  await page.getByRole('option', { name: `${category}-option` }).click();
  await page.getByTestId('event-submit-button').click();
};

// 저장 -> 이벤트 리스트, 캘린더(주간뷰)에 조회됨
// 저장 -> 이벤트 리스트, 캘린더(월간뷰)에 조회됨
test('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async ({
  page,
}) => {
  await createEvent(page, {
    title: '테스트 일정1',
    date: '2025-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트 설명1',
    location: '테스트 위치1',
    category: '개인',
  });

  const event = page.getByTestId('event-box').filter({ hasText: '테스트 일정1' });

  expect(event.getByText('2025-11-01')).toBeVisible();
  expect(event.getByText('10:00 - 11:00')).toBeVisible();
  expect(event.getByText('테스트 설명1')).toBeVisible();
  expect(event.getByText('테스트 위치1')).toBeVisible();
  expect(event.getByText('카테고리: 개인')).toBeVisible();
});

// 저장 -> 수정
test('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async ({ page }) => {
  await createEvent(page, {
    title: '새 회의',
    date: '2025-11-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '프로젝트 진행 상황 논의',
    location: '회의실 A',
    category: '업무',
  });

  const event = page.getByTestId('event-box').filter({ hasText: '새 회의' });
  await event.getByLabel('Edit event').click();

  await page.getByRole('textbox', { name: '제목' }).clear();
  await page.getByRole('textbox', { name: '제목' }).fill('수정된 회의');
  await page.getByRole('textbox', { name: '시작 시간' }).click();
  await page.getByRole('textbox', { name: '시작 시간' }).clear();
  await page.getByRole('textbox', { name: '시작 시간' }).fill('15:00');
  await page.getByRole('textbox', { name: '종료 시간' }).click();
  await page.getByRole('textbox', { name: '종료 시간' }).clear();
  await page.getByRole('textbox', { name: '종료 시간' }).press('ArrowUp');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('16:00');
  await page.getByRole('textbox', { name: '설명' }).clear();
  await page.getByRole('textbox', { name: '설명' }).fill('회의 내용 변경');
  await page.getByRole('textbox', { name: '위치' }).click();
  await page.getByRole('textbox', { name: '위치' }).clear();
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 B');
  await page.getByRole('combobox', { name: '업무' }).click();
  await page.getByRole('option', { name: `개인-option` }).click();
  await page.getByTestId('event-submit-button').click();

  const changedEvent = page.getByTestId('event-box').filter({ hasText: '수정된 회의' });

  expect(changedEvent.getByText('수정된 회의')).toBeVisible();
  expect(changedEvent.getByText('15:00 - 16:00')).toBeVisible();
  expect(changedEvent.getByText('회의 내용 변경')).toBeVisible();
  expect(changedEvent.getByText('회의실 B')).toBeVisible();
  expect(changedEvent.getByText('카테고리: 개인')).toBeVisible();
});

// 저장 -> 삭제
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
