'use client';

import styles from './RoomCodeInput.module.css';

interface RoomCodeInputProps {
  value: string;
  loading: boolean;
  error: string | null;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export default function RoomCodeInput({
  value,
  loading,
  error,
  onChange,
  onSubmit,
}: RoomCodeInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSubmit();
  }

  return (
    <div className={styles.root}>
      <div className={styles.fieldRow}>
        <input
          className={styles.input}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ENTER CODE"
          maxLength={8}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-label="Room code"
          disabled={loading}
        />
        <button
          className={styles.joinBtn}
          onClick={onSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'CONNECTING…' : 'JOIN ROOM'}
        </button>
      </div>

      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}
    </div>
  );
}