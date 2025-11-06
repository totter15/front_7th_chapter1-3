import { test, expect } from './fixtures';
import { Page } from '@playwright/test';
import { RepeatInfo } from '../../types';

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
    repeat,
  }: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: '개인' | '업무' | '가족' | '기타';
    repeat?: RepeatInfo;
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

  if (repeat) {
    await page.getByRole('checkbox', { name: '반복 일정' }).check();
    await page.getByText('매일').click();
    await page.getByRole('option', { name: `${repeat.type}-option` }).click();
    await page.getByRole('spinbutton', { name: '반복 간격' }).click();
    await page.getByRole('spinbutton', { name: '반복 간격' }).fill(String(repeat.interval));
    if (repeat.endDate) {
      await page.getByRole('textbox', { name: '반복 종료일' }).fill(repeat.endDate!);
    }
  }

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
  const modifiedEvent = page.getByTestId('event-box').filter({ hasText: '수정된 회의' });

  await expect(modifiedEvent.getByText('수정된 회의')).toBeVisible();
  await expect(modifiedEvent.getByText('15:00 - 16:00')).toBeVisible();
  await expect(modifiedEvent.getByText('회의 내용 변경')).toBeVisible();
  await expect(modifiedEvent.getByText('회의실 B')).toBeVisible();
  await expect(modifiedEvent.getByText('카테고리: 개인')).toBeVisible();

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

test('입력한 새로운 반복 일정 정보에 맞춰 모든 필드가 이벤트 리스트, 캘린더(주간뷰),캘린더(월간뷰)에 정확히 저장된다.', async ({
  page,
}) => {
  await createEvent(page, {
    title: '테스트 일정1',
    date: '2025-11-03',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트 설명1',
    location: '테스트 위치1',
    category: '개인',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-12-01' },
  });

  const event = page
    .getByTestId('event-box')
    .filter({ hasText: '반복: 1주마다 (종료: 2025-12-01)' });
  expect(event).toHaveCount(4);

  // 월간뷰에 조회됨
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'Month' }).click();

  const monthView = page.getByTestId('month-view');
  await expect(monthView.getByText('테스트 일정1')).toHaveCount(4);

  // 주간뷰에 조회됨
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByRole('option', { name: 'week-option' }).click();

  const weekView = page.getByTestId('week-view');
  await expect(weekView.getByText('테스트 일정1')).toBeVisible();
});

test.describe('반복 일정 수정 워크플로우 테스트', () => {
  test('반복 일정을 수정하는 경우 수정 모달에서 예를 선택시 해당 일정만 수정되고 반복 일정에 관한 표시가 사라진다', async ({
    page,
  }) => {
    await createEvent(page, {
      title: '반복 회의',
      date: '2025-11-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '매주 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-11-17' },
    });

    // 반복 일정이 생성되었는지 확인
    const events = page.getByTestId('event-box').filter({ hasText: '반복 회의' });
    await expect(events.first()).toBeVisible();

    // 첫 번째 반복 일정 수정
    const firstEvent = events.first();
    await firstEvent.getByLabel('Edit event').click();

    // 반복 일정 수정 다이얼로그가 나타나는지 확인
    await expect(page.getByText('반복 일정 수정')).toBeVisible();
    await expect(page.getByText('해당 일정만 수정하시겠어요?')).toBeVisible();

    // "예" 선택 (해당 일정만 수정)
    await page.getByRole('button', { name: '예' }).click();

    // 일정 수정
    await page.getByRole('textbox', { name: '제목' }).clear();
    await page.getByRole('textbox', { name: '제목' }).fill('수정된 회의');
    await page.getByRole('textbox', { name: '시작 시간' }).clear();
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
    await page.getByRole('textbox', { name: '종료 시간' }).clear();
    await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
    await page.getByTestId('event-submit-button').click();

    // 수정된 일정 확인 (반복 표시가 사라짐)
    const modifiedEvent = page.getByTestId('event-box').filter({ hasText: '수정된 회의' });
    await expect(modifiedEvent).toBeVisible();
    await expect(modifiedEvent).not.toHaveText('반복:');

    // 나머지 반복 일정은 그대로 유지
    const remainingEvents = page.getByTestId('event-box').filter({ hasText: '반복 회의' });
    await expect(remainingEvents.first()).toBeVisible();
  });

  test('반복 일정을 수정하는 경우 수정 모달에서 아니요를 선택시 모든 반복일정이 수정된다.', async ({
    page,
  }) => {
    await createEvent(page, {
      title: '매주 스터디',
      date: '2025-11-03',
      startTime: '14:00',
      endTime: '16:00',
      description: '주간 스터디',
      location: '스터디룸',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-11-17' },
    });

    // 반복 일정이 생성되었는지 확인
    const events = page.getByTestId('event-box').filter({ hasText: '매주 스터디' });
    await expect(events.first()).toBeVisible();

    // 첫 번째 반복 일정 수정
    const firstEvent = events.first();
    await firstEvent.getByLabel('Edit event').click();

    // 반복 일정 수정 다이얼로그가 나타나는지 확인
    await expect(page.getByText('반복 일정 수정')).toBeVisible();
    await expect(page.getByText('해당 일정만 수정하시겠어요?')).toBeVisible();

    // "아니오" 선택 (모든 반복 일정 수정)
    await page.getByRole('button', { name: '아니오' }).click();

    // 일정 수정
    await page.getByRole('textbox', { name: '제목' }).clear();
    await page.getByRole('textbox', { name: '제목' }).fill('전체 수정된 스터디');
    await page.getByRole('textbox', { name: '설명' }).clear();
    await page.getByRole('textbox', { name: '설명' }).fill('수정된 설명');
    await page.getByTestId('event-submit-button').click();

    // 모든 반복 일정이 수정되었는지 확인
    const modifiedEvents = page.getByTestId('event-box').filter({ hasText: '전체 수정된 스터디' });
    await expect(modifiedEvents.first()).toBeVisible();
    await expect(modifiedEvents.first()).toHaveText(/수정된 설명/);

    // 기존 제목의 일정은 존재하지 않음
    const oldEvents = page.getByTestId('event-box').filter({ hasText: '매주 스터디' });
    await expect(oldEvents.first()).not.toBeVisible();
  });

  test('반복 일정을 수정하는 경우 수정 모달에서 취소를 선택시 일정이 수정되지 않는다.', async ({
    page,
  }) => {
    await createEvent(page, {
      title: '팀 미팅',
      date: '2025-11-03',
      startTime: '11:00',
      endTime: '12:00',
      description: '주간 팀 미팅',
      location: '본사',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-11-17' },
    });

    // 반복 일정이 생성되었는지 확인
    const events = page.getByTestId('event-box').filter({ hasText: '팀 미팅' });
    await expect(events.first()).toBeVisible();

    // 첫 번째 반복 일정 수정 시도
    const firstEvent = events.first();
    await firstEvent.getByLabel('Edit event').click();

    // 반복 일정 수정 다이얼로그가 나타나는지 확인
    await expect(page.getByText('반복 일정 수정')).toBeVisible();
    await expect(page.getByText('해당 일정만 수정하시겠어요?')).toBeVisible();

    // "취소" 선택
    await page.getByRole('button', { name: '취소' }).click();

    // 다이얼로그가 닫혔는지 확인
    await expect(page.getByText('반복 일정 수정')).not.toBeVisible();

    // 일정이 수정되지 않았는지 확인
    const unchangedEvents = page.getByTestId('event-box').filter({ hasText: '팀 미팅' });
    await expect(unchangedEvents.first()).toBeVisible();
    await expect(unchangedEvents.first()).toHaveText(/주간 팀 미팅/);
  });
});

test.describe('반복 일정 삭제 워크플로우 테스트', () => {
  test('반복 일정을 삭제하는 경우 삭제 모달에서 예를 선택시 해당 일정만 삭제되고 반복 일정에 관한 표시가 사라진다', async ({
    page,
  }) => {
    await createEvent(page, {
      title: '일일 운동',
      date: '2025-11-03',
      startTime: '07:00',
      endTime: '08:00',
      description: '아침 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'daily', interval: 1, endDate: '2025-11-07' },
    });

    // 반복 일정이 생성되었는지 확인
    const events = page.getByTestId('event-box').filter({ hasText: '일일 운동' });
    const firstEvent = events.first();
    await expect(firstEvent).toBeVisible();

    // 첫 번째 반복 일정 삭제
    await firstEvent.getByLabel('Delete event').click();

    // 반복 일정 삭제 다이얼로그가 나타나는지 확인
    await expect(page.getByText('반복 일정 삭제')).toBeVisible();
    await expect(page.getByText('해당 일정만 삭제하시겠어요?')).toBeVisible();

    // "예" 선택 (해당 일정만 삭제)
    await page.getByRole('button', { name: '예' }).click();

    // 해당 일정만 삭제되었는지 확인
    const remainingEvents = page.getByTestId('event-box').filter({ hasText: '일일 운동' });
    await expect(remainingEvents).toHaveCount(4);
  });

  test('반복 일정을 삭제하는 경우 삭제 모달에서 아니요를 선택시 모든 반복일정이 삭제된다.', async ({
    page,
  }) => {
    await createEvent(page, {
      title: '주간 리뷰',
      date: '2025-11-03',
      startTime: '17:00',
      endTime: '18:00',
      description: '주간 회고',
      location: '사무실',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-11-24' },
    });

    // 반복 일정이 생성되었는지 확인
    const events = page.getByTestId('event-box').filter({ hasText: '주간 리뷰' });
    const firstEvent = events.first();
    await expect(firstEvent).toBeVisible();

    // 첫 번째 반복 일정 삭제
    await firstEvent.getByLabel('Delete event').click();

    // 반복 일정 삭제 다이얼로그가 나타나는지 확인
    await expect(page.getByText('반복 일정 삭제')).toBeVisible();
    await expect(page.getByText('해당 일정만 삭제하시겠어요?')).toBeVisible();

    // "아니오" 선택 (모든 반복 일정 삭제)
    await page.getByRole('button', { name: '아니오' }).click();

    // 모든 반복 일정이 삭제되었는지 확인
    const remainingEvents = page.getByTestId('event-box').filter({ hasText: '주간 리뷰' });
    await expect(remainingEvents).toHaveCount(0);
  });

  test('반복 일정을 삭제하는 경우 삭제 모달에서 취소를 선택시 일정이 삭제되지 않는다.', async ({
    page,
  }) => {
    await createEvent(page, {
      title: '월간 보고',
      date: '2025-11-03',
      startTime: '15:00',
      endTime: '16:00',
      description: '월별 보고서 작성',
      location: '회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-12-03' },
    });

    // 반복 일정이 생성되었는지 확인
    const events = page.getByTestId('event-box').filter({ hasText: '월간 보고' });
    const firstEvent = events.first();
    await expect(events.first()).toBeVisible();

    // 첫 번째 반복 일정 삭제 시도
    await firstEvent.getByLabel('Delete event').click();

    // 반복 일정 삭제 다이얼로그가 나타나는지 확인
    await expect(page.getByText('반복 일정 삭제')).toBeVisible();
    await expect(page.getByText('해당 일정만 삭제하시겠어요?')).toBeVisible();

    // "취소" 선택
    await page.getByRole('button', { name: '취소' }).click();

    // 다이얼로그가 닫혔는지 확인
    await expect(page.getByText('반복 일정 삭제')).not.toBeVisible();

    // 일정이 삭제되지 않았는지 확인
    const unchangedEvents = page.getByTestId('event-box').filter({ hasText: '월간 보고' });
    const finalCount = await unchangedEvents.count();
    expect(finalCount).toBe(1);
    await expect(unchangedEvents.first()).toBeVisible();
    await expect(unchangedEvents.first()).toHaveText(/월별 보고서 작성/);
  });
});
