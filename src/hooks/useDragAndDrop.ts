import { useState } from 'react';

import { Event } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface PendingDrop {
  event: Event;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}

export const useDragAndDrop = (
  events: Event[],
  saveEvent: (event: Event) => Promise<void>,
  onOverlapDetected: (overlapping: Event[]) => void
) => {
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
      await saveEvent(updatedEvent);
    } catch (error) {
      console.error(error);
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
  };
};

