import React, { useState } from 'react';

import { Event } from '../types';

interface PendingDrop {
  event: Event;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}

const createUpdatedEvent = ({
  event,
  newDate,
  newStartTime,
  newEndTime,
}: {
  event: Event;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}): Event => {
  return {
    ...event,
    date: newDate,
    startTime: newStartTime,
    endTime: newEndTime,
    repeat: event.repeat.type !== 'none' ? { type: 'none', interval: 1 } : event.repeat,
  };
};

export const useDragAndDrop = (
  onConfirm: (updatedEvent: Event) => Promise<void>,
  onConfirmOpen: (updatedEvent: Event) => void,
  onConfirmClose: () => void
) => {
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
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
    const dropInfo = {
      event: draggedEvent,
      newDate: targetDate,
      newStartTime: draggedEvent.startTime,
      newEndTime: draggedEvent.endTime,
    };

    setPendingDrop(dropInfo);

    const updatedEvent = createUpdatedEvent(dropInfo);
    onConfirmOpen(updatedEvent);
  };

  /**
   * 드래그 확인 다이얼로그에서 확인 버튼 클릭 시 호출되는 핸들러
   */
  const handleDragConfirm = async () => {
    if (!pendingDrop) return;
    const updatedEvent = createUpdatedEvent(pendingDrop);

    await onConfirm(updatedEvent);
    onConfirmClose();
    resetDragState();
  };

  /**
   * 드래그 확인 다이얼로그에서 취소 버튼 클릭 시 호출되는 핸들러
   */
  const handleDragCancel = () => {
    onConfirmClose();
    resetDragState();
  };

  const resetDragState = () => {
    setPendingDrop(null);
    setDraggedEvent(null);
  };

  /**
   * 겹침 경고 다이얼로그에서 확인 버튼 클릭 시 호출되는 핸들러
   * 겹침을 무시하고 이벤트를 저장합니다.
   */
  const handleOverlapConfirm = async () => {
    if (!pendingDrop) return;

    const updatedEvent = createUpdatedEvent(pendingDrop);

    await onConfirm(updatedEvent);
    resetDragState();
  };

  return {
    draggedEvent,
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
