-- V7: Notifications and Audit Hardening (FR-20, RNF-08)

-- 1. In-App User Notifications (FR-20)
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    module VARCHAR(30) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_notifications_user ON user_notifications(user_id, is_read, created_at DESC);

-- 2. Audit Logs Hardening (RNF-08: Append-Only)
-- Remove existing foreign key from audit_logs that uses ON DELETE CASCADE and replace with ON DELETE RESTRICT
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_building_id_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS fk_audit_logs_building;

ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_logs_building
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE RESTRICT;

-- Function and trigger to prevent UPDATE or DELETE on audit_logs
CREATE OR REPLACE FUNCTION trg_protect_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable append-only records. Updates and deletes are forbidden.';
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;

CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION trg_protect_audit_logs();
