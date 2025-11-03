import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event } from '../types';

interface DragAndDropConfirmDialogProps {
  open: boolean;
  event: Event | null;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DragAndDropConfirmDialog = ({
  open,
  event,
  newDate,
  newStartTime,
  newEndTime,
  onConfirm,
  onCancel,
}: DragAndDropConfirmDialogProps) => {
  if (!event) return null;

  const isRepeating = event.repeat.type !== 'none';

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>일정 이동 확인</DialogTitle>
      <DialogContent>
        <Typography>일정: {event.title}</Typography>
        <Typography>
          변경 전: {event.date} {event.startTime}-{event.endTime}
        </Typography>
        <Typography>
          변경 후: {newDate} {newStartTime}-{newEndTime}
        </Typography>
        {isRepeating && (
          <Typography sx={{ mt: 2, color: 'warning.main' }}>
            반복 일정이 단일 일정으로 변환됩니다
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>취소</Button>
        <Button onClick={onConfirm} variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DragAndDropConfirmDialog;
