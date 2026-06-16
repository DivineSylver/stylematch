export type User = {
  id: string;
  email: string;
  points_balance: number;
  subscription_status: 'free' | 'active';
  created_at: string;
};

export type StudySession = {
  id: string;
  watcher_id: string;
  creator_handle: string;
  topic: string;
  generated_posts: string[];
  created_at: string;
};

export type WatcherLog = {
  id: string;
  watcher_id: string;
  creator_handle: string;
  timestamp: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: 'topup' | 'subscription';
  amount: number;
  stripe_payment_id: string | null;
  created_at: string;
};
