import { APIRequestContext, Page } from '@playwright/test';

import { EventForm, RepeatInfo } from '../../types';

type EventFormWithNotificationTime = Omit<EventForm, 'notificationTime' | 'repeat'> & {
  notificationTime?: number;
  repeat?: RepeatInfo;
};

export const createEvent = async (page: Page, eventForm: EventFormWithNotificationTime) => {
  await filledEventForm(page, eventForm);
  await page.getByTestId('event-submit-button').click();
};

export const filledEventForm = async (
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
    notificationTime = 10,
  }: EventFormWithNotificationTime
) => {
  await page.getByRole('textbox', { name: '제목' }).click();
  await page.getByRole('textbox', { name: '제목' }).clear();
  await page.getByRole('textbox', { name: '제목' }).fill(title);

  await page.getByRole('textbox', { name: '날짜' }).fill(date);

  await page.getByRole('textbox', { name: '시작 시간' }).click();
  await page.getByRole('textbox', { name: '시작 시간' }).clear();
  await page.getByRole('textbox', { name: '시작 시간' }).fill(startTime);

  await page.getByRole('textbox', { name: '종료 시간' }).click();
  await page.getByRole('textbox', { name: '종료 시간' }).clear();
  await page.getByRole('textbox', { name: '종료 시간' }).fill(endTime);

  await page.getByRole('textbox', { name: '설명' }).click();
  await page.getByRole('textbox', { name: '설명' }).clear();
  await page.getByRole('textbox', { name: '설명' }).fill(description);

  await page.getByRole('textbox', { name: '위치' }).click();
  await page.getByRole('textbox', { name: '위치' }).clear();
  await page.getByRole('textbox', { name: '위치' }).fill(location);

  await page.getByRole('combobox', { name: '업무' }).click();
  await page.getByRole('option', { name: `${category}-option` }).click();
  await page.getByRole('combobox', { name: '10분 전' }).click();
  await page.getByRole('option', { name: `${notificationTime}-option` }).click();
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
};

export const cleanupAllEvents = async (request: APIRequestContext) => {
  const response = await request.put('http://localhost:3000/api/events/reset');
  return response;
};
