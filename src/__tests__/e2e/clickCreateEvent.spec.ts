import { createEvent } from './utils';
import { test, expect } from './fixtures';

test('월간뷰에서 날짜 셀 클릭 시 날짜가 자동으로 채워지며, 일정 저장시 해당날짜에 일정이 생성된다', async ({
  page,
}) => {
  // 월간뷰로 전환
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'Month' }).click();

  // 특정 날짜 셀 클릭 (11월 15일)
  const monthView = page.getByTestId('month-view');
  const dateCell = monthView.getByTestId('drop-target-2025-11-15');
  await dateCell.click();

  // 날짜 필드가 자동으로 채워졌는지 확인
  const dateInput = page.getByRole('textbox', { name: '날짜' });
  await expect(dateInput).toHaveValue('2025-11-15');

  // 일정 정보 입력
  await page.getByRole('textbox', { name: '제목' }).fill('날짜 클릭 테스트');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
  await page.getByRole('textbox', { name: '설명' }).fill('클릭으로 생성된 일정');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실');
  await page.getByRole('combobox', { name: '업무' }).click();
  await page.getByRole('option', { name: '업무-option' }).click();

  // 일정 저장
  await page.getByTestId('event-submit-button').click();

  // 해당 날짜에 일정이 생성되었는지 확인
  const event = page.getByTestId('event-box').filter({ hasText: '날짜 클릭 테스트' });
  await expect(event.getByText('2025-11-15')).toBeVisible();
  await expect(event.getByText('10:00 - 11:00')).toBeVisible();

  // 성공 메시지 확인
  await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
});

test('주간뷰에서 날짜 셀 클릭 시 날짜가 자동으로 채워지며, 일정 저장시 해당날짜에 일정이 생성된다', async ({
  page,
}) => {
  // 주간뷰로 전환
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'week-option' }).click();

  // 특정 날짜 셀 클릭 (11월 5일)
  const weekView = page.getByTestId('week-view');
  const dateCell = weekView.getByTestId('drop-target-2025-11-05');
  await dateCell.click();

  // 날짜 필드가 자동으로 채워졌는지 확인
  const dateInput = page.getByRole('textbox', { name: '날짜' });
  await expect(dateInput).toHaveValue('2025-11-05');

  // 일정 정보 입력
  await page.getByRole('textbox', { name: '제목' }).fill('주간뷰 클릭 테스트');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');
  await page.getByRole('textbox', { name: '설명' }).fill('주간뷰에서 생성');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 B');
  await page.getByRole('combobox', { name: '업무' }).click();
  await page.getByRole('option', { name: '개인-option' }).click();

  // 일정 저장
  await page.getByTestId('event-submit-button').click();

  // 해당 날짜에 일정이 생성되었는지 확인
  const event = page.getByTestId('event-box').filter({ hasText: '주간뷰 클릭 테스트' });
  await expect(event.getByText('2025-11-05')).toBeVisible();
  await expect(event.getByText('14:00 - 15:00')).toBeVisible();

  // 성공 메시지 확인
  await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
});

test('일정이 이미 있는 날짜클릭시에도 날짜가 자동으로 채워지며, 일정 저장시 해당날짜에 일정이 생성된다', async ({
  page,
}) => {
  // 먼저 일정 하나 생성
  await createEvent(page, {
    title: '기존 일정',
    date: '2025-11-10',
    startTime: '09:00',
    endTime: '10:00',
    description: '이미 있는 일정',
    location: '회의실 A',
    category: '업무',
  });

  // 월간뷰로 전환
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'Month' }).click();

  // 일정이 이미 있는 날짜 셀 클릭 (11월 10일)
  const monthView = page.getByTestId('month-view');
  const dateCell = monthView.getByTestId('drop-target-2025-11-10');
  await dateCell.click();

  // 날짜 필드가 자동으로 채워졌는지 확인
  const dateInput = page.getByRole('textbox', { name: '날짜' });
  await expect(dateInput).toHaveValue('2025-11-10');

  // 새로운 일정 정보 입력
  await page.getByRole('textbox', { name: '제목' }).fill('추가 일정');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('11:00');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('12:00');
  await page.getByRole('textbox', { name: '설명' }).fill('같은 날 추가 일정');
  await page.getByRole('textbox', { name: '위치' }).fill('회의실 B');
  await page.getByRole('combobox', { name: '업무' }).click();
  await page.getByRole('option', { name: '업무-option' }).click();

  // 일정 저장
  await page.getByTestId('event-submit-button').click();

  // 해당 날짜에 새로운 일정이 추가되었는지 확인
  const newEvent = page.getByTestId('event-box').filter({ hasText: '추가 일정' });
  await expect(newEvent.getByText('2025-11-10')).toBeVisible();
  await expect(newEvent.getByText('11:00 - 12:00')).toBeVisible();

  // 기존 일정도 여전히 존재하는지 확인
  const existingEvent = page.getByTestId('event-box').filter({ hasText: '기존 일정' });
  await expect(existingEvent.getByText('2025-11-10')).toBeVisible();

  // 성공 메시지 확인
  await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
});
