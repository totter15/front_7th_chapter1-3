import { useState } from 'react';

interface UseDateSelectionProps {
  onDateSelect: (_dateString: string) => void;
}

export const useDateSelection = ({ onDateSelect }: UseDateSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateCellClick = (dateString: string) => {
    // 선택된 날짜 설정 (시각적 피드백용)
    setSelectedDate(dateString);
    // 외부 콜백 호출 (폼 설정, 편집 모드 초기화 등)
    onDateSelect(dateString);
  };

  return {
    selectedDate,
    handleDateCellClick,
  };
};
