import { test, expect } from './fixtures';
import { createEvent } from './utils';

test.beforeEach(async ({ page }) => {
  // 테스트용 일정들 생성
  await createEvent(page, {
    title: '팀 회의',
    date: '2025-11-10',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
  });

  await createEvent(page, {
    title: '프로젝트 계획',
    date: '2025-11-11',
    startTime: '14:00',
    endTime: '15:00',
    description: '새 프로젝트 수립',
    location: '회의실 B',
    category: '업무',
  });

  await createEvent(page, {
    title: '점심 약속',
    date: '2025-11-12',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '강남역 레스토랑',
    category: '개인',
  });
});

test('검색어가 비어있을 때 모든 일정을 반환해야 한다', async ({ page }) => {
  // 검색어 입력 없이 모든 일정 표시 확인
  const searchInput = page.getByPlaceholder('검색어를 입력하세요');
  await expect(searchInput).toHaveValue('');

  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText('팀 회의')).toBeVisible();
  await expect(eventList.getByText('프로젝트 계획')).toBeVisible();
  await expect(eventList.getByText('점심 약속')).toBeVisible();
});

test('제목에 맞는 일정을 반환해야 한다', async ({ page }) => {
  const searchInput = page.getByPlaceholder('검색어를 입력하세요');
  await searchInput.fill('팀 회의');

  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText('팀 회의')).toBeVisible();
  await expect(eventList.getByText('프로젝트 계획')).not.toBeVisible();
  await expect(eventList.getByText('점심 약속')).not.toBeVisible();
});

test('설명에 맞는 일정을 반환해야 한다', async ({ page }) => {
  const searchInput = page.getByPlaceholder('검색어를 입력하세요');
  await searchInput.fill('프로젝트');

  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText('프로젝트 계획')).toBeVisible();
  await expect(eventList.getByText('팀 회의')).not.toBeVisible();
  await expect(eventList.getByText('점심 약속')).not.toBeVisible();
});

test('위치에 맞는 일정을 반환해야 한다', async ({ page }) => {
  const searchInput = page.getByPlaceholder('검색어를 입력하세요');
  await searchInput.fill('강남역');

  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText('점심 약속')).toBeVisible();
  await expect(eventList.getByText('팀 회의')).not.toBeVisible();
  await expect(eventList.getByText('프로젝트 계획')).not.toBeVisible();
});

test('검색 결과가 없으면 "검색 결과가 없습니다."가 표시되어야 한다', async ({ page }) => {
  const searchInput = page.getByPlaceholder('검색어를 입력하세요');
  await searchInput.fill('존재하지 않는 일정');

  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText('검색 결과가 없습니다.')).toBeVisible();
});

test('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async ({ page }) => {
  const searchInput = page.getByPlaceholder('검색어를 입력하세요');

  // 검색어 입력
  await searchInput.fill('강남역');

  // 검색 결과 확인
  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText('점심 약속')).toBeVisible();

  // 검색어 지우기
  await searchInput.clear();

  // 모든 일정 다시 표시
  await expect(eventList.getByText('팀 회의')).toBeVisible();
  await expect(eventList.getByText('프로젝트 계획')).toBeVisible();
  await expect(eventList.getByText('점심 약속')).toBeVisible();
});
