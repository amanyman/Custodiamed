-- ============================================
-- Auto-expire shares and invitations
-- ============================================

-- Function to expire old shares (default 7 days)
CREATE OR REPLACE FUNCTION expire_old_shares()
RETURNS void AS $$
BEGIN
  -- Expire file shares older than 7 days
  UPDATE file_shares
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active'
  AND expires_at IS NOT NULL
  AND expires_at < NOW();

  -- Expire provider invitations
  UPDATE provider_invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
  AND expires_at < NOW();

  -- Expire regular invitations
  UPDATE invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set default expires_at on file_shares if not set (7 days from creation)
ALTER TABLE file_shares
ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '7 days');
