import { test, expect } from './fixtures';
import { createEvent } from './utils';

test.describe('겹치는 시간에 새 일정을 추가할 때 경고가 노출된다', () => {
  test.beforeEach(async ({ page }) => {
    // 첫 번째 일정 생성
    await createEvent(page, {
      title: '기존 회의',
      date: '2025-11-05',
      startTime: '14:00',
      endTime: '15:00',
      description: '기존 회의입니다',
      location: '회의실 A',
      category: '업무',
    });

    // 기존 일정이 생성되었는지 확인
    const existingEvent = page.getByTestId('event-box').filter({ hasText: '기존 회의' });
    await expect(existingEvent).toBeVisible();

    // 겹치는 시간에 새 일정 추가 시도
    await createEvent(page, {
      title: '새 미팅',
      date: '2025-11-05',
      startTime: '14:30',
      endTime: '15:30',
      description: '겹치는 시간의 일정',
      location: '회의실 B',
      category: '업무',
    });
  });

  //  취소
  test('다이얼로그에서 취소 버튼 클릭시 일정이 생성되지 않는다.', async ({ page }) => {
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await expect(page.getByText(/다음 일정과 겹칩니다|일정이 겹칩니다/)).toBeVisible();

    await page.getByRole('button', { name: '취소' }).click();

    // 일정이 생성되지 않는지 확인
    await expect(page.getByTestId('event-box').filter({ hasText: '새 미팅' })).not.toBeVisible();
  });

  // 계속 진행
  test('다이얼로그에서 계속진행 버튼 클릭시 해당 시간으로 일정이 생성된다.', async ({ page }) => {
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await expect(page.getByText(/다음 일정과 겹칩니다|일정이 겹칩니다/)).toBeVisible();

    await page.getByRole('button', { name: '계속 진행' }).click();

    // 해당 시간에 일정이 생성되었는지 확인
    const newEvent = page.getByTestId('event-box').filter({ hasText: '새 미팅' });
    await expect(newEvent.getByText('14:30 - 15:30')).toBeVisible();
  });
});

test.describe('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', () => {
  test.beforeEach(async ({ page }) => {
    // 첫 번째 일정 생성
    await createEvent(page, {
      title: '오전 회의',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '오전 팀 회의',
      location: '회의실 A',
      category: '업무',
    });

    // 두 번째 일정 생성 (겹치지 않는 시간)
    await createEvent(page, {
      title: '오후 미팅',
      date: '2025-11-06',
      startTime: '14:00',
      endTime: '15:00',
      description: '오후 미팅',
      location: '회의실 B',
      category: '업무',
    });

    // 두 일정이 모두 생성되었는지 확인
    await expect(page.getByTestId('event-box').filter({ hasText: '오전 회의' })).toBeVisible();
    await expect(page.getByTestId('event-box').filter({ hasText: '오후 미팅' })).toBeVisible();

    // 오후 미팅의 시간을 오전 회의와 겹치도록 수정
    const afternoonEvent = page.getByTestId('event-box').filter({ hasText: '오후 미팅' });
    await afternoonEvent.getByLabel('Edit event').click();

    await page.getByRole('textbox', { name: '시작 시간' }).clear();
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:30');
    await page.getByRole('textbox', { name: '종료 시간' }).clear();
    await page.getByRole('textbox', { name: '종료 시간' }).fill('11:30');
    await page.getByTestId('event-submit-button').click();
  });

  // 취소
  test('다이얼로그에서 취소 버튼 클릭시 일정이 수정되지 않는다.', async ({ page }) => {
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await expect(page.getByText(/다음 일정과 겹칩니다|일정이 겹칩니다/)).toBeVisible();

    await page.getByRole('button', { name: '취소' }).click();

    // 일정이 수정되지 않는지 확인
    const modifiedEvent = page.getByTestId('event-box').filter({ hasText: '오후 미팅' });
    await expect(modifiedEvent.getByText('14:00 - 15:00')).toBeVisible();
  });

  // 계속 진행
  test('다이얼로그에서 계속 진행 클릭시 해당 시간으로 일정이 수정된다.', async ({ page }) => {
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await expect(page.getByText(/다음 일정과 겹칩니다|일정이 겹칩니다/)).toBeVisible();

    await page.getByRole('button', { name: '계속 진행' }).click();

    // 해당 시간에 일정이 수정되었는지 확인
    const modifiedEvent = page.getByTestId('event-box').filter({ hasText: '오후 미팅' });
    await expect(modifiedEvent.getByText('10:30 - 11:30')).toBeVisible();
  });
});
