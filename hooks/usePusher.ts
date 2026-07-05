"use client";

import { useEffect, useRef } from "react";

export function usePusherChannel<T>(
  channel: string,
  event: string,
  callback: (data: T) => void
) {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  });

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pusherInstance: any;
    let active = true;

    import("pusher-js").then(({ default: Pusher }) => {
      if (!active) return;
      pusherInstance = new Pusher(key, { cluster });
      const ch = pusherInstance.subscribe(channel);
      ch.bind(event, (data: T) => cbRef.current(data));
    });

    return () => {
      active = false;
      pusherInstance?.disconnect();
    };
  }, [channel, event]);
}
