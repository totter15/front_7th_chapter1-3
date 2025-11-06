# 드래그 앤 드롭 기능 구현 시 발생한 문제와 해결방안

## 날짜: 2025-11-02
## 이슈: issue-001-drag-and-drop

---

## 문제 1: 토스트 메시지 불일치

### 증상
- 테스트 실패: `Unable to find an element with the text: 일정이 수정되었습니다.`
- 실제 메시지: "일정이 수정되었습니다" (마침표 없음)
- 테스트 기대: "일정이 수정되었습니다." (마침표 있음)

### 원인
- 성공 메시지 상수(`SUCCESS_MESSAGES`)와 테스트에서 사용하는 메시지가 일관성 없음
- 일부 테스트는 마침표 있음, 일부는 마침표 없음으로 작성됨

### 해결방안
1. **성공 메시지 상수 확인**: `src/hooks/useEventOperations.ts`의 `SUCCESS_MESSAGES` 상수 확인
2. **일관성 유지**: 모든 토스트 메시지는 성공 메시지 상수에 정의된 것과 정확히 일치해야 함
3. **테스트 수정**: 테스트에서 메시지를 확인할 때는 상수에 정의된 값을 그대로 사용
4. **마침표 규칙**: 현재 프로젝트에서는 토스트 메시지에 마침표를 사용하지 않음 (일관성 유지)

### 적용된 수정
```typescript
// 테스트 수정 전
expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

// 테스트 수정 후
expect(await screen.findByText('일정이 수정되었습니다')).toBeInTheDocument();
```

---

## 문제 2: useEventOperations의 editing 플래그 문제

### 증상
- 드래그 앤 드롭으로 일정을 이동할 때 "일정이 추가되었습니다" 메시지가 표시됨
- 기대: "일정이 수정되었습니다" 메시지

### 원인
- `useEventOperations(editing)` 훅의 `editing` 플래그가 정적으로 전달됨
- 드래그 앤 드롭은 `editing=false`로 초기화된 상태에서 일정을 수정하므로 추가로 인식됨

### 해결방안
1. **동적 editing 판별**: `saveEvent` 함수 내부에서 `eventData.id` 존재 여부로 편집/추가 판별
2. **코드 수정**:
```typescript
// 수정 전
if (editing) { ... }

// 수정 후
const isEditing = editing || !!(eventData as Event).id;
if (isEditing) { ... }
```

### 적용된 수정
`src/hooks/useEventOperations.ts`의 `saveEvent` 함수에서 `id` 기반 편집 모드 판별 추가

---

## 문제 3: DialogContentText 중첩 p 태그 경고

### 증상
- 콘솔 경고: `In HTML, <p> cannot be a descendant of <p>.`
- DialogContentText(p) 안에 Typography(p)를 중첩하면 HTML 유효성 오류 발생

### 원인
- MUI의 `DialogContentText`는 기본적으로 `<p>` 태그로 렌더링됨
- 그 안에 `Typography`도 기본적으로 `<p>` 태그로 렌더링되어 중첩 발생

### 해결방안
1. **DialogContentText 제거**: DialogContent 안에 직접 Typography 사용
2. **코드 수정**:
```typescript
// 수정 전
<DialogContent>
  <DialogContentText>
    <Typography>일정: {event.title}</Typography>
  </DialogContentText>
</DialogContent>

// 수정 후
<DialogContent>
  <Typography>일정: {event.title}</Typography>
  <Typography>변경 전: ...</Typography>
  <Typography>변경 후: ...</Typography>
</DialogContent>
```

### 적용된 수정
`src/components/DragAndDropConfirmDialog.tsx`에서 DialogContentText 제거

---

## 문제 4: 겹침 다이얼로그와 드래그 앤 드롭 상태 관리

### 증상
- 겹침 다이얼로그에서 "취소"를 클릭해도 드래그 앤 드롭 상태가 유지됨
- 다시 드래그하면 이전 pendingDrop 정보가 남아있어 혼란 발생

### 원인
- 겹침 다이얼로그의 "취소" 버튼이 `pendingDrop` 상태를 초기화하지 않음
- 드래그 앤 드롭과 일반 일정 추가/수정이 같은 겹침 다이얼로그를 공유하지만 상태 관리가 분리되지 않음

### 해결방안
1. **취소 시 드래그 상태 초기화**: 겹침 다이얼로그 닫을 때 `pendingDrop` 확인 후 초기화
2. **코드 수정**:
```typescript
// 수정 전
<Dialog open={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)}>
  <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
</Dialog>

// 수정 후
<Dialog 
  open={isOverlapDialogOpen} 
  onClose={() => {
    setIsOverlapDialogOpen(false);
    if (pendingDrop) {
      setPendingDrop(null);
      setDraggedEvent(null);
    }
  }}
>
  <Button onClick={() => {
    setIsOverlapDialogOpen(false);
    if (pendingDrop) {
      setPendingDrop(null);
      setDraggedEvent(null);
    }
  }}>취소</Button>
</Dialog>
```

### 적용된 수정
`src/App.tsx`의 겹침 다이얼로그 onClose 및 취소 버튼에 pendingDrop 초기화 로직 추가

---

## 문제 5: Component 테스트에서 텍스트 검색 실패

### 증상
- 테스트 실패: `Unable to find an element with the text: 테스트 회의`
- 실제 렌더링: "일정: 테스트 회의" (복합 텍스트)

### 원인
- Typography 컴포넌트에서 "일정: {event.title}"로 렌더링
- 테스트가 "테스트 회의"만 검색하여 매칭 실패

### 해결방안
1. **정규표현식 사용**: 전체 텍스트 패턴을 정규표현식으로 검색
2. **코드 수정**:
```typescript
// 수정 전
expect(screen.getByText('테스트 회의')).toBeInTheDocument();
expect(screen.getByText(/2025-10-15/)).toBeInTheDocument();
expect(screen.getByText(/09:00.*10:00/)).toBeInTheDocument();

// 수정 후
expect(screen.getByText(/일정:.*테스트 회의/)).toBeInTheDocument();
expect(screen.getByText(/변경 전:.*2025-10-15.*09:00.*10:00/)).toBeInTheDocument();
expect(screen.getByText(/변경 후:.*2025-10-16.*10:00.*11:00/)).toBeInTheDocument();
```

### 적용된 수정
`src/__tests__/components/DragAndDropConfirmDialog.spec.tsx`에서 정규표현식 패턴 사용

---

## 문제 6: 겹침 다이얼로그 버튼 이름 불일치

### 증상
- 테스트 실패: `Unable to find a role "button" with name "계속"`
- 실제 버튼 텍스트: "계속 진행"

### 원인
- App.tsx에서 버튼 텍스트를 "계속 진행"으로 설정
- 테스트에서는 "계속"으로 검색

### 해결방안
1. **버튼 이름 확인**: 실제 컴포넌트에서 사용하는 버튼 텍스트 확인
2. **테스트 수정**: 정확한 버튼 이름 사용
```typescript
// 수정 전
const continueButton = screen.getByRole('button', { name: '계속' });

// 수정 후
const continueButton = screen.getByRole('button', { name: '계속 진행' });
```

### 적용된 수정
`src/__tests__/integration/dragAndDropWorkflow.spec.tsx`에서 버튼 이름 수정

---

## 교훈 및 체크리스트

### ✅ 구현 전 확인사항
1. **메시지 상수 확인**: 토스트 메시지는 반드시 상수에 정의된 값 사용
2. **기존 컴포넌트 확인**: 버튼 텍스트, 다이얼로그 제목 등 기존 패턴 확인
3. **상태 관리 설계**: 공유 다이얼로그 사용 시 각 플로우별 상태 초기화 로직 추가

### ✅ 테스트 작성 시 확인사항
1. **복합 텍스트는 정규표현식**: "일정: 제목" 같은 복합 텍스트는 정규표현식으로 검색
2. **정확한 버튼 이름**: getByRole('button', { name }) 사용 시 정확한 버튼 텍스트 사용
3. **다이얼로그 스코프**: 여러 다이얼로그가 있을 경우 `within(dialog)`로 범위 한정

### ✅ Lint/타입 체크
1. **HTML 유효성**: p 안에 p 중첩 금지, DialogContentText 사용 시 주의
2. **MUI 컴포넌트**: DialogContent 안에 직접 Typography 사용 권장

---

## 에이전트 프롬프트 개선 제안

### 테스트 코드 작성 에이전트 (test-code-developer.md)

추가할 체크리스트:
- [ ] 토스트 메시지는 SUCCESS_MESSAGES/ERROR_MESSAGES 상수에 정의된 값을 정확히 사용했는가?
- [ ] 복합 텍스트 검증 시 정규표현식을 사용했는가?
- [ ] 버튼 이름(getByRole)은 실제 컴포넌트의 텍스트와 정확히 일치하는가?
- [ ] 여러 다이얼로그가 있을 경우 within()으로 범위를 한정했는가?

### 구현 에이전트 (implementaion-developer.md)

추가할 체크리스트:
- [ ] 토스트 메시지 사용 시 SUCCESS_MESSAGES/ERROR_MESSAGES 상수를 사용했는가?
- [ ] 새로운 메시지가 필요한 경우 상수에 추가했는가?
- [ ] DialogContentText 안에 Typography를 중첩하지 않았는가?
- [ ] 공유 다이얼로그 사용 시 각 플로우별 상태 초기화 로직을 추가했는가?
- [ ] testId를 사용하기 전에 해당 testId가 실제로 필요한지 확인했는가?







