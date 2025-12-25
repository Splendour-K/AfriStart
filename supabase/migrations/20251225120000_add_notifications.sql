-- Notifications tables and policies
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('message','group','idea','system','admin')) DEFAULT 'system',
  href TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email BOOLEAN DEFAULT TRUE,
  push BOOLEAN DEFAULT TRUE,
  messages BOOLEAN DEFAULT TRUE,
  mentions BOOLEAN DEFAULT TRUE,
  groups BOOLEAN DEFAULT TRUE,
  product BOOLEAN DEFAULT FALSE,
  digest BOOLEAN DEFAULT TRUE,
  priority BOOLEAN DEFAULT TRUE,
  quiet BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their notification prefs" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their notification prefs" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notification prefs" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
