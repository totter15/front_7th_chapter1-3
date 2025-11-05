import { Close } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import DragAndDropConfirmDialog from './components/DragAndDropConfirmDialog.tsx';
import RecurringEventDialog from './components/RecurringEventDialog.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useDateSelection } from './hooks/useDateSelection.ts';
import { useDragAndDrop } from './hooks/useDragAndDrop.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types.ts';

import { findOverlappingEvents } from './utils/eventOverlap.ts';
import { getTimeErrorMessage } from './utils/timeValidation.ts';
import Calendar from './components/Calendar.tsx';
import EventBox from './components/EventBox.tsx';
import OverlappingConfirmDialog from './components/OverlappingConfirmDialog.tsx';
import InputForm from './components/InputForm.tsx';
import SelectForm from './components/SelectForm.tsx';

export const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

const categories = ['업무', '개인', '가족', '기타'];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const {
    events,
    saveEvent,
    editEvent: updateEvent,
    deleteEvent,
    createRepeatEvent,
    fetchEvents,
  } = useEventOperations(() => setEditingEvent(null));

  const { handleRecurringEdit, handleRecurringDelete } = useRecurringEventOperations(
    events,
    async () => {
      // After recurring edit, refresh events from server
      await fetchEvents();
    }
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<Event | null>(null);
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState<Event | null>(null);
  const [recurringEditMode, setRecurringEditMode] = useState<boolean | null>(null); // true = single, false = all
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete'>('edit');
  const [isDragConfirmOpen, setIsDragConfirmOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // Date selection hook
  const { selectedDate, handleDateCellClick } = useDateSelection({
    onDateSelect: (dateString: string) => {
      // 편집 모드 초기화
      setEditingEvent(null);
      // 폼 초기화
      resetForm();
      // 클릭한 날짜 설정
      setDate(dateString);
    },
  });

  // Drag and Drop hook
  const {
    draggedEvent,
    pendingDrop,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragConfirm,
    handleDragCancel,
    resetDragState,
    handleOverlapConfirm,
  } = useDragAndDrop(
    async (updatedEvent: Event) => {
      // 드래그 성공 시 실행할 작업
      await updateEvent(updatedEvent);
    },
    () => {
      // 드래그 앤 드롭 직후에는 항상 확인 다이얼로그 열기
      setIsDragConfirmOpen(true);
    },
    () => setIsDragConfirmOpen(false) // 모달 닫기
  );

  // 드래그 확인 다이얼로그에서 저장 버튼 클릭 시 겹침 검사 수행
  const handleDragSave = async () => {
    if (!pendingDrop) return;

    const updatedEvent = {
      ...pendingDrop.event,
      date: pendingDrop.newDate,
      startTime: pendingDrop.newStartTime,
      endTime: pendingDrop.newEndTime,
      repeat:
        pendingDrop.event.repeat.type !== 'none'
          ? { type: 'none' as const, interval: 1 }
          : pendingDrop.event.repeat,
    };

    // 겹침 검사
    const overlapping = findOverlappingEvents(updatedEvent, events);

    if (overlapping.length > 0) {
      // 겹침이 있으면 겹침 경고 다이얼로그 열기
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      setIsDragConfirmOpen(false);
    } else {
      // 겹침이 없으면 바로 저장
      await handleDragConfirm();
    }
  };

  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    if (recurringDialogMode === 'edit' && pendingRecurringEdit) {
      // 편집 모드 저장하고 편집 폼으로 이동
      setRecurringEditMode(editSingleOnly);
      editEvent(pendingRecurringEdit);
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
    } else if (recurringDialogMode === 'delete' && pendingRecurringDelete) {
      // 반복 일정 삭제 처리
      try {
        await handleRecurringDelete(pendingRecurringDelete, editSingleOnly);
        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringDelete(null);
    }
  };

  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  const handleEditEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring edit dialog
      setPendingRecurringEdit(event);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event editing
      editEvent(event);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring delete dialog
      setPendingRecurringDelete(event);
      setRecurringDialogMode('delete');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event deletion
      deleteEvent(event.id);
    }
  };

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent
        ? editingEvent.repeat // Keep original repeat settings for recurring event detection
        : {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    // 수정
    if (editingEvent) {
      if (hasOverlapEvent) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        return;
      }

      if (
        editingEvent.repeat.type !== 'none' &&
        editingEvent.repeat.interval > 0 &&
        recurringEditMode !== null
      ) {
        await handleRecurringEdit(eventData as Event, recurringEditMode);
        setRecurringEditMode(null);
      } else {
        await updateEvent(eventData as Event);
      }

      resetForm();
      return;
    }

    // 생성
    if (isRepeating) {
      // 반복 생성은 반복 일정을 고려하지 않는다.
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    if (hasOverlapEvent) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  const handleOverlapClose = () => {
    setIsOverlapDialogOpen(false);
    if (pendingDrop) {
      resetDragState();
    }
  };

  const handleOverlapConfirmAction = async () => {
    setIsOverlapDialogOpen(false);
    // 드래그 앤 드롭인 경우
    if (pendingDrop) {
      await handleOverlapConfirm();
    } else {
      // 일반 일정 추가/수정
      const eventData = {
        title,
        date,
        startTime,
        endTime,
        description,
        location,
        category,
        repeat: {
          type: isRepeating ? repeatType : 'none',
          interval: repeatInterval,
          endDate: repeatEndDate || undefined,
        },
        notificationTime,
      };

      if (editingEvent) {
        await updateEvent({ ...eventData, id: editingEvent.id } as Event);
      } else {
        await saveEvent(eventData);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <Stack spacing={2} sx={{ width: '20%' }}>
          <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

          <InputForm
            id="title"
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <InputForm
            id="date"
            label="날짜"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <InputForm
              id="start-time"
              label="시작 시간"
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              error={startTimeError}
            />

            <InputForm
              id="end-time"
              label="종료 시간"
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              error={endTimeError}
            />
          </Stack>

          <InputForm
            id="description"
            label="설명"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <InputForm
            id="location"
            label="위치"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <SelectForm
            id="category"
            label="카테고리"
            labelId="category-label"
            value={category}
            onChange={(value) => setCategory(value as string)}
            options={categories.map((cat) => ({
              value: cat,
              label: cat,
              ariaLabel: `${cat}-option`,
            }))}
            ariaLabel="카테고리"
          />

          {!editingEvent && (
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRepeating}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsRepeating(checked);
                      if (checked) {
                        setRepeatType('daily');
                      } else {
                        setRepeatType('none');
                      }
                    }}
                  />
                }
                label="반복 일정"
              />
            </FormControl>
          )}

          {/* ! TEST CASE */}
          {isRepeating && !editingEvent && (
            <Stack spacing={2}>
              <SelectForm
                label="반복 유형"
                value={repeatType}
                onChange={(value) => setRepeatType(value as RepeatType)}
                options={[
                  { value: 'daily', label: '매일', ariaLabel: 'daily-option' },
                  { value: 'weekly', label: '매주', ariaLabel: 'weekly-option' },
                  { value: 'monthly', label: '매월', ariaLabel: 'monthly-option' },
                  { value: 'yearly', label: '매년', ariaLabel: 'yearly-option' },
                ]}
                ariaLabel="반복 유형"
              />
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
                  <TextField
                    id="repeat-interval"
                    size="small"
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </FormControl>
                <InputForm
                  id="repeat-end-date"
                  label="반복 종료일"
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => setRepeatEndDate(e.target.value)}
                />
              </Stack>
            </Stack>
          )}

          <SelectForm
            id="notification"
            label="알림 설정"
            value={notificationTime}
            onChange={(value) => setNotificationTime(Number(value))}
            options={notificationOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />

          <Button
            data-testid="event-submit-button"
            onClick={addOrUpdateEvent}
            variant="contained"
            color="primary"
          >
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
        </Stack>

        <Calendar
          view={view}
          setView={setView}
          currentDate={currentDate}
          weekDays={weekDays}
          selectedDate={selectedDate as string}
          handleDateCellClick={handleDateCellClick}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          draggedEvent={draggedEvent}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          holidays={holidays}
          navigate={navigate}
        />

        <Stack
          data-testid="event-list"
          spacing={2}
          sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
        >
          <FormControl fullWidth>
            <FormLabel htmlFor="search">일정 검색</FormLabel>
            <TextField
              id="search"
              size="small"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>

          {filteredEvents.length === 0 ? (
            <Typography>검색 결과가 없습니다.</Typography>
          ) : (
            filteredEvents.map((event) => (
              <EventBox
                key={event.id}
                event={event}
                isNotifiedEvent={notifiedEvents.includes(event.id)}
                handleEditEvent={handleEditEvent}
                handleDeleteEvent={handleDeleteEvent}
              />
            ))
          )}
        </Stack>
      </Stack>

      <OverlappingConfirmDialog
        open={isOverlapDialogOpen}
        onClose={handleOverlapClose}
        overlappingEvents={overlappingEvents}
        handleOverlapConfirmAction={handleOverlapConfirmAction}
      />

      {/* 반복 일정 수정/삭제 */}
      <RecurringEventDialog
        open={isRecurringDialogOpen}
        onClose={() => {
          setIsRecurringDialogOpen(false);
          setPendingRecurringEdit(null);
          setPendingRecurringDelete(null);
        }}
        onConfirm={handleRecurringConfirm}
        event={recurringDialogMode === 'edit' ? pendingRecurringEdit : pendingRecurringDelete}
        mode={recurringDialogMode}
      />

      {/* drag and drop 확인 다이얼로그 */}
      <DragAndDropConfirmDialog
        open={isDragConfirmOpen}
        event={pendingDrop?.event || null}
        newDate={pendingDrop?.newDate || ''}
        newStartTime={pendingDrop?.newStartTime || ''}
        newEndTime={pendingDrop?.newEndTime || ''}
        onConfirm={handleDragSave}
        onCancel={handleDragCancel}
      />

      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default App;
