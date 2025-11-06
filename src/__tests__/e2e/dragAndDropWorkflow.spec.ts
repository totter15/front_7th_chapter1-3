import { createEvent } from './utils';
import { test, expect } from './fixtures';

test('월간뷰에서 일정을 드래그하여 다른 날짜로 이동하고 저장하면 일정이 새 날짜에 표시된다', async ({
  page,
}) => {
  // 일정 생성
  await createEvent(page, {
    title: '드래그 테스트',
    date: '2025-11-06',
    startTime: '10:00',
    endTime: '11:00',
    description: '이동할 일정',
    location: '회의실',
    category: '업무',
  });

  // 월간뷰로 전환
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'Month' }).click();

  // 드래그할 일정 찾기
  const monthView = page.getByTestId('month-view');
  const sourceEvent = monthView.getByText('드래그 테스트');

  // 타겟 날짜 셀 찾기 (11월 13일)
  const targetCell = monthView.getByTestId('drop-target-2025-11-13');

  // 드래그 앤 드롭 수행
  await sourceEvent.dragTo(targetCell);

  // 확인 다이얼로그 표시 확인
  await expect(page.getByText('일정 이동 확인')).toBeVisible();
  await expect(page.getByText('변경 전: 2025-11-06')).toBeVisible(); // 변경 전
  await expect(page.getByText('변경 후: 2025-11-13')).toBeVisible(); // 변경 후

  // 저장 버튼 클릭
  await page.getByRole('button', { name: '저장' }).click();

  // 새 날짜에 일정이 표시되는지 확인
  const event = page.getByTestId('event-box').filter({ hasText: '드래그 테스트' });
  await expect(event.getByText('2025-11-13')).toBeVisible();

  // 성공 메시지 확인
  await expect(page.getByText('일정이 수정되었습니다')).toBeVisible();
});

test('주간뷰에서 일정을 드래그하여 다른 날짜로 이동하고 저장하면 일정이 새 날짜에 표시된다', async ({
  page,
}) => {
  // 일정 생성
  await createEvent(page, {
    title: '주간 드래그 테스트',
    date: '2025-11-03',
    startTime: '14:00',
    endTime: '15:00',
    description: '이동할 일정',
    location: '회의실',
    category: '개인',
  });

  // 주간뷰로 전환
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'week-option' }).click();

  // 드래그할 일정 찾기
  const weekView = page.getByTestId('week-view');
  const sourceEvent = weekView.getByText('주간 드래그 테스트');

  // 타겟 날짜 셀 찾기 (11월 4일)
  const targetCell = weekView.getByTestId('drop-target-2025-11-04');

  // 드래그 앤 드롭 수행
  await sourceEvent.dragTo(targetCell);

  // 확인 다이얼로그에서 저장
  await expect(page.getByText('일정 이동 확인')).toBeVisible();
  await expect(page.getByText('변경 전: 2025-11-03')).toBeVisible(); // 변경 전
  await expect(page.getByText('변경 후: 2025-11-04')).toBeVisible(); // 변경 후
  await page.getByRole('button', { name: '저장' }).click();

  // 새 날짜에 일정이 표시되는지 확인
  const event = page.getByTestId('event-box').filter({ hasText: '주간 드래그 테스트' });
  await expect(event.getByText('2025-11-04')).toBeVisible();

  // 성공 메시지 확인
  await expect(page.getByText('일정이 수정되었습니다')).toBeVisible();
});

test.describe('일정을 드래그하여 다른 날짜로 이동하고 이동할 날짜에 일정이 겹치면 경고 모달이 표시된다.', () => {
  test.beforeEach(async ({ page }) => {
    // 기존 일정 생성 (11월 10일)
    await createEvent(page, {
      title: '기존 일정',
      date: '2025-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '고정 일정',
      location: '회의실 A',
      category: '업무',
    });

    // 이동할 일정 생성 (11월 6일)
    await createEvent(page, {
      title: '이동할 일정',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '겹칠 예정',
      location: '회의실 B',
      category: '업무',
    });

    // 월간뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'Month' }).click();
  });

  test('계속 진행 클릭시 일정이 수정된다.', async ({ page }) => {
    const monthView = page.getByTestId('month-view');

    // 드래그 앤 드롭 (11월 6일 → 11월 10일)
    const sourceEvent = monthView.getByText('이동할 일정').first();
    const targetCell = monthView.getByTestId('drop-target-2025-11-10');
    await sourceEvent.dragTo(targetCell);

    // 이동 확인 다이얼로그에서 저장
    await page.getByRole('button', { name: '저장' }).click();

    // 겹침 경고 다이얼로그 표시 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();

    // 계속 진행 클릭
    await page.getByRole('button', { name: '계속 진행' }).click();

    // 일정이 새 날짜로 이동되었는지 확인
    const movedEvent = page.getByTestId('event-box').filter({ hasText: '이동할 일정' });
    await expect(movedEvent.getByText('2025-11-10')).toBeVisible();
  });

  test('취소 클릭시 일정이 수정되지 않는다.', async ({ page }) => {
    const monthView = page.getByTestId('month-view');

    // 드래그 앤 드롭 (11월 6일 → 11월 10일)
    const sourceEvent = monthView.getByText('이동할 일정').first();
    const targetCell = monthView.getByTestId('drop-target-2025-11-10');
    await sourceEvent.dragTo(targetCell);

    // 이동 확인 다이얼로그에서 저장
    await page.getByRole('button', { name: '저장' }).click();

    // 겹침 경고 다이얼로그에서 취소
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await page.getByRole('button', { name: '취소' }).click();

    // 일정이 원래 날짜에 유지되는지 확인
    const event = page.getByTestId('event-box').filter({ hasText: '이동할 일정' });
    await expect(event.getByText('2025-11-06')).toBeVisible();
  });
});

test('드래그앤드롭 후 확인 다이얼로그에서 취소 클릭시 일정이 이동되지 않는다', async ({ page }) => {
  await createEvent(page, {
    title: '취소 테스트',
    date: '2025-11-06',
    startTime: '10:00',
    endTime: '11:00',
    description: '이동 취소',
    location: '회의실',
    category: '업무',
  });

  // 월간뷰로 전환
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'Month' }).click();

  const monthView = page.getByTestId('month-view');
  const sourceEvent = monthView.getByText('취소 테스트');
  const targetCell = monthView.getByTestId('drop-target-2025-11-13');

  // 드래그 앤 드롭
  await sourceEvent.dragTo(targetCell);

  // 확인 다이얼로그에서 취소
  await expect(page.getByText('일정 이동 확인')).toBeVisible();
  await page.getByRole('button', { name: '취소' }).click();

  // 일정이 원래 날짜에 유지
  const event = page.getByTestId('event-box').filter({ hasText: '취소 테스트' });
  await expect(event.getByText('2025-11-06')).toBeVisible();
});

test('반복일정을 드래그하여 다른 날짜로 이동하면 단일일정으로 변환된다.', async ({ page }) => {
  // 반복 일정 생성
  await createEvent(page, {
    title: '반복 일정',
    date: '2025-11-03',
    startTime: '10:00',
    endTime: '11:00',
    description: '매주 반복',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-11-24' },
  });

  // 월간뷰로 전환
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'Month' }).click();

  const monthView = page.getByTestId('month-view');

  // 첫 번째 반복 일정 드래그
  const sourceEvent = monthView.getByText('반복 일정').first();
  const targetCell = monthView.getByTestId('drop-target-2025-11-07');

  // 드래그 앤 드롭
  await sourceEvent.dragTo(targetCell);

  // 확인 다이얼로그에 반복 일정 변환 안내 표시
  await expect(page.getByText('일정 이동 확인')).toBeVisible();
  await expect(page.getByText(/반복 일정이 단일 일정으로 변환됩니다/)).toBeVisible();

  // 저장
  await page.getByRole('button', { name: '저장' }).click();

  // 이동된 일정이 단일 일정으로 변환되었는지 확인 (반복 표시가 없어야 함)
  const movedEvent = page.getByTestId('event-box').filter({ hasText: '반복 일정' }).first();
  await expect(movedEvent.getByText('2025-11-07')).toBeVisible();
  await expect(movedEvent).not.toHaveText(/반복:/);
});
