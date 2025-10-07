import React, { useState, useEffect } from "react";

interface TimerProps {
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ onTimeUp }) => {
  const [time, setTime] = useState<number>(60); // 60秒のタイマー

  useEffect(() => {
    if (time <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setTimeout(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [time, onTimeUp]);

  return (
    <p className="timer_time">
      {time}
      <span>s</span>
    </p>
  );
};

export default Timer;
