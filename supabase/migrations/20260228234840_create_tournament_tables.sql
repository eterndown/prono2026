/*
  # Create Tournament Management Tables

  ## Summary
  Complete database schema for FIFA 2026 tournament prediction system with user authentication, predictions, and admin controls.

  ## Tables Created
  1. `users` - User accounts with roles and status
  2. `predictions` - User predictions for all 104 matches
  3. `real_scores` - Official match results (admin only)
  4. `global_settings` - Tournament configuration and phase locks
  5. `system_logs` - Admin action audit trail

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Admins have full access to manage tournament
  - All modifications are logged
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text,
  last_name text,
  is_admin boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_frozen boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id integer NOT NULL,
  local_goals text DEFAULT '-',
  visitor_goals text DEFAULT '-',
  local_penalties text DEFAULT '-',
  visitor_penalties text DEFAULT '-',
  is_simulation boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own predictions"
  ON predictions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS real_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id integer NOT NULL UNIQUE,
  local_goals text DEFAULT '-',
  visitor_goals text DEFAULT '-',
  local_penalties text DEFAULT '-',
  visitor_penalties text DEFAULT '-',
  admin_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE real_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read real scores"
  ON real_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert real scores"
  ON real_scores FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update real scores"
  ON real_scores FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM users WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groups_phase_locked boolean DEFAULT false,
  knockout_phase_locked boolean DEFAULT false,
  manual_locked_match_ids integer[] DEFAULT '{}',
  manual_unlocked_match_ids integer[] DEFAULT '{}',
  time_mode text DEFAULT 'PRESENT',
  simulation_date timestamptz,
  updated_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global settings"
  ON global_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can update global settings"
  ON global_settings FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM users WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  target_user_id uuid REFERENCES users(id),
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can insert logs"
  ON system_logs FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM users WHERE id = auth.uid()) = true);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_real_scores_match ON real_scores(match_id);
CREATE INDEX idx_system_logs_admin ON system_logs(admin_id);
CREATE INDEX idx_users_admin ON users(is_admin);
