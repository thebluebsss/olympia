import type { VercelRequest, VercelResponse } from '@vercel/node';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'ap1',
  useTLS: true,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { socket_id, channel_name } = req.body;

  if (!socket_id || !channel_name) {
    return res.status(400).json({ error: 'Missing socket_id or channel_name' });
  }

  try {
    const authResponse = pusher.authorizeChannel(socket_id, channel_name);
    res.status(200).json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
