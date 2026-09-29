-- V5: Seed common areas for both test buildings (US-06 - Amenity Booking).
-- Tables common_areas and reservations already exist from V1.

INSERT INTO common_areas (id, building_id, name, max_capacity, open_time, close_time, rules_text, is_active) VALUES
('ca100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Party Hall',        50, '09:00:00', '23:00:00', 'No loud music after 22:00. Cleaning fee included.', TRUE),
('ca100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Gourmet Barbecue',  20, '10:00:00', '22:00:00', 'Cleaning fee included. Max 20 guests.',             TRUE),
('ca100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Sports Court',      30, '07:00:00', '21:00:00', 'Bring your own equipment.',                         TRUE),
('ca200000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'Party Hall',        40, '09:00:00', '23:00:00', 'No loud music after 22:00.',                        TRUE),
('ca200000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'Rooftop Terrace',   25, '08:00:00', '22:00:00', 'No glass containers allowed.',                      TRUE)
ON CONFLICT (id) DO NOTHING;
