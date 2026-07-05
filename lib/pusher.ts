import Pusher from "pusher";

let _pusher: Pusher | null = null;

export function getPusher(): Pusher | null {
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) return null;
  if (!_pusher) {
    _pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
      useTLS: true,
    });
  }
  return _pusher;
}
