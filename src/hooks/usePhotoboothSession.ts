"use client";

import { useCallback, useState } from "react";
import { appPath } from "@/lib/utils/base-path";

export function usePhotoboothSession(eventId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startSession = useCallback(
    async (layoutId: string, frameId: string) => {
      const response = await fetch(appPath(`/api/events/${eventId}/sessions`), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ layoutId, frameId, deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop" })
      });
      if (response.ok) {
        const data = (await response.json()) as { id: string };
        setSessionId(data.id);
        return data.id;
      }
      return null;
    },
    [eventId]
  );

  const completeSession = useCallback(async () => {
    if (!sessionId) return;
    await fetch(appPath(`/api/sessions/${sessionId}/complete`), { method: "POST" });
  }, [sessionId]);

  return { sessionId, startSession, completeSession };
}
