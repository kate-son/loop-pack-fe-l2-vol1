type ErrorRetryProps = {
  /** 표시할 에러 메시지 */
  message: string;
  /** 다시 시도 버튼 클릭 시 호출 */
  onRetry: () => void;
};

/* AI-generated */
export function ErrorRetry({ message, onRetry }: ErrorRetryProps) {
  return (
    <div role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}
