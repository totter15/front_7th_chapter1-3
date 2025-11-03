import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { Event } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface PendingDrop {
  event: Event;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}

// 메시지 상수
const SUCCESS_MESSAGES = {
  EVENT_UPDATED: '일정이 수정되었습니다',
} as const;

const ERROR_MESSAGES = {
  SAVE_FAILED: '일정 저장 실패',
} as const;

export const useDragAndDrop = (
  events: Event[],
  fetchEvents: () => Promise<void>,
  onOverlapDetected: (_overlappingEvents: Event[]) => void
) => {
  const { enqueueSnackbar } = useSnackbar();
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [isDragConfirmOpen, setIsDragConfirmOpen] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);

  const handleDragStart = (event: Event) => {
    setDraggedEvent(event);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDate: string) => {
    if (!draggedEvent) return;

    // 날짜만 변경, 시간은 유지
    setPendingDrop({
      event: draggedEvent,
      newDate: targetDate,
      newStartTime: draggedEvent.startTime,
      newEndTime: draggedEvent.endTime,
    });
    setIsDragConfirmOpen(true);
  };

  const handleDragConfirm = async () => {
    if (!pendingDrop) return;

    const { event, newDate, newStartTime, newEndTime } = pendingDrop;

    // 반복 일정인 경우 단일 일정으로 변환
    const updatedEvent: Event = {
      ...event,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      repeat: event.repeat.type !== 'none' ? { type: 'none', interval: 1 } : event.repeat,
    };

    // 겹침 검사
    const overlapping = findOverlappingEvents(updatedEvent, events);
    if (overlapping.length > 0) {
      setIsDragConfirmOpen(false);
      onOverlapDetected(overlapping);
      return;
    }

    try {
      // 드래그 앤 드롭은 항상 수정(PUT)이므로 직접 API 호출
      const response = await fetch(`/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      enqueueSnackbar(SUCCESS_MESSAGES.EVENT_UPDATED, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(ERROR_MESSAGES.SAVE_FAILED, { variant: 'error' });
    }

    setIsDragConfirmOpen(false);
    setPendingDrop(null);
    setDraggedEvent(null);
  };

  const handleDragCancel = () => {
    setIsDragConfirmOpen(false);
    setPendingDrop(null);
    setDraggedEvent(null);
  };

  const resetDragState = () => {
    setPendingDrop(null);
    setDraggedEvent(null);
  };

  const handleOverlapConfirm = async () => {
    if (!pendingDrop) return;

    const { event, newDate, newStartTime, newEndTime } = pendingDrop;

    const updatedEvent: Event = {
      ...event,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      repeat: event.repeat.type !== 'none' ? { type: 'none', interval: 1 } : event.repeat,
    };

    try {
      const response = await fetch(`/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      enqueueSnackbar(SUCCESS_MESSAGES.EVENT_UPDATED, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(ERROR_MESSAGES.SAVE_FAILED, { variant: 'error' });
    }

    resetDragState();
  };

  return {
    draggedEvent,
    isDragConfirmOpen,
    pendingDrop,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragConfirm,
    handleDragCancel,
    resetDragState,
    handleOverlapConfirm,
  };
};
