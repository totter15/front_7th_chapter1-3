import { test, expect } from './fixtures';
import { createEvent } from './utils';

test('알림이 설정된 일정은 알림 시간에 맞춰 알림이 노출된다.', async ({ page }) => {
  // 현재 시간으로부터 15분 후의 일정 생성
  const now = new Date('2025-11-06T10:00:00');
  await page.clock.install({ time: now });
  await page.clock.resume();

  await createEvent(page, {
    title: '알림 테스트 일정',
    date: '2025-11-06',
    startTime: '10:15', // 15분 후
    endTime: '10:30',
    description: '알림이 설정된 일정',
    location: '회의실 B',
    category: '업무',
    notificationTime: 10,
  });

  // 알림이 아직 표시되지 않음
  await expect(page.getByText(/알림 테스트 일정.*시작됩니다/)).not.toBeVisible();

  // 시간을 5분 후로 이동 (일정 시작 10분 전)
  await page.clock.fastForward('00:05:00');

  // 알림이 표시됨
  await expect(page.getByText(/10분 후.*알림 테스트 일정.*시작됩니다/)).toBeVisible();
});

test('여러 일정에 대한 알림이 순차적으로 표시된다.', async ({ page }) => {
  const now = new Date('2025-11-07T09:00:00');
  await page.clock.install({ time: now });
  await page.clock.resume();

  // 첫 번째 일정
  await createEvent(page, {
    title: '첫 번째 회의',
    date: '2025-11-07',
    startTime: '09:15',
    endTime: '09:20',
    description: '첫 번째 알림 일정',
    location: '회의실 A',
    category: '업무',
    notificationTime: 10,
  });

  // 두 번째 일정
  await createEvent(page, {
    title: '두 번째 회의',
    date: '2025-11-07',
    startTime: '09:20',
    endTime: '09:35',
    description: '두 번째 알림 일정',
    location: '회의실 B',
    category: '업무',
    notificationTime: 10,
  });

  // 5분 후로 이동 (첫 번째 일정 10분 전)
  await page.clock.fastForward('00:05:00');
  await expect(page.getByText(/첫 번째 회의.*시작됩니다/)).toBeVisible();

  // 5분 더 이동 (두 번째 일정 10분 전)
  await page.clock.fastForward('00:05:00');
  await expect(page.getByText(/두 번째 회의.*시작됩니다/)).toBeVisible();
});
