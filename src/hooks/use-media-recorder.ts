"use client";

import { useCallback, useRef, useState } from "react";

export function useMediaRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4",
    });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const b = new Blob(chunksRef.current, { type: recorder.mimeType });
      setBlob(b);
      setRecording(false);
      stopTimer();
    };
    mediaRef.current = recorder;
    recorder.start(250);
    setRecording(true);
    setSeconds(0);
    setBlob(null);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return true;
  }, []);

  const stop = useCallback(() => {
    if (mediaRef.current?.state === "recording") {
      mediaRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    stopTimer();
    setBlob(null);
    setSeconds(0);
    setRecording(false);
  }, [stop]);

  return { recording, seconds, blob, start, stop, reset };
}
