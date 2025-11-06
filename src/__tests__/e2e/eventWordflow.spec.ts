import { test, expect } from './fixtures';
import { Page } from '@playwright/test';

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

// 저장 -> 이벤트 리스트, 캘린더(주간뷰),캘린더(월간뷰)에 조회됨
test('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트, 캘린더(주간뷰),캘린더(월간뷰)에 정확히 저장된다.', async ({
  page,
}) => {
  await createEvent(page, {
    title: '테스트 일정1',
    date: '2025-11-02',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트 설명1',
    location: '테스트 위치1',
    category: '개인',
  });

  // 이벤트 리스트에 조회됨
  const event = page.getByTestId('event-box').filter({ hasText: '테스트 일정1' });

  await expect(event.getByText('2025-11-02')).toBeVisible();
  await expect(event.getByText('10:00 - 11:00')).toBeVisible();
  await expect(event.getByText('테스트 설명1')).toBeVisible();
  await expect(event.getByText('테스트 위치1')).toBeVisible();
  await expect(event.getByText('카테고리: 개인')).toBeVisible();

  // 월간뷰에 조회됨
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'Month' }).click();

  const monthView = page.getByTestId('month-view');
  await expect(monthView.getByText('테스트 일정1')).toBeVisible();

  // 주간뷰에 조회됨
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'week-option' }).click();

  const weekView = page.getByTestId('week-view');
  await expect(weekView.getByText('테스트 일정1')).toBeVisible();
});

// 저장 -> 수정
test('기존 일정의 세부 정보를 수정하고 변경사항이 이벤트 리스트, 캘린더(주간뷰),캘린더(월간뷰)에 반영된다', async ({
  page,
}) => {
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

  // 이벤트 리스트에 조회됨
  const changedEvent = page.getByTestId('event-box').filter({ hasText: '수정된 회의' });

  await expect(changedEvent.getByText('수정된 회의')).toBeVisible();
  await expect(changedEvent.getByText('15:00 - 16:00')).toBeVisible();
  await expect(changedEvent.getByText('회의 내용 변경')).toBeVisible();
  await expect(changedEvent.getByText('회의실 B')).toBeVisible();
  await expect(changedEvent.getByText('카테고리: 개인')).toBeVisible();

  // 월간뷰에 조회됨
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'Month' }).click();

  const monthView = page.getByTestId('month-view');
  await expect(monthView.getByText('수정된 회의')).toBeVisible();

  // 주간뷰에 조회됨
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'week-option' }).click();

  const weekView = page.getByTestId('week-view');
  await expect(weekView.getByText('수정된 회의')).toBeVisible();
});

// 저장 -> 삭제
test('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async ({ page }) => {
  await createEvent(page, {
    title: '삭제할 일정',
    date: '2025-11-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '삭제할 일정입니다.',
    location: '삭제할 위치',
    category: '기타',
  });

  const event = page.getByTestId('event-box').filter({ hasText: '삭제할 일정' });
  await event.getByLabel('Delete event').click();

  await expect(event).not.toBeVisible();

  // 월간뷰에 조회됨
  const monthView = page.getByTestId('month-view');
  await expect(monthView).not.toHaveText('삭제할 일정');

  // 주간뷰에 조회됨
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'week-option' }).click();

  const weekView = page.getByTestId('week-view');
  await expect(weekView).not.toHaveText('삭제할 일정');
});
