-- ============================================================================
-- PermitOS — Seed data
-- Launch municipalities + compliance rules ported from the MVP analyzer.
-- Run after 0001_initial_schema.sql.
-- ============================================================================

-- Launch municipalities -------------------------------------------------------
insert into municipalities (id, name, county, state, codes_version, is_live)
values
  ('11111111-1111-1111-1111-111111111111', 'Miami Beach',     'Miami-Dade', 'FL', '2026.1', true),
  ('22222222-2222-2222-2222-222222222222', 'Miami-Dade County','Miami-Dade', 'FL', '2026.1', true),
  ('33333333-3333-3333-3333-333333333333', 'North Bay Village','Miami-Dade', 'FL', '2026.1', true),
  ('44444444-4444-4444-4444-444444444444', 'City of Miami',   'Miami-Dade', 'FL', null,     false),
  ('55555555-5555-5555-5555-555555555555', 'Coral Gables',    'Miami-Dade', 'FL', null,     false);

-- Miami-Dade Chapter 18A — Landscape rules -----------------------------------
insert into municipality_rules (municipality_id, code, title, description, category) values
  ('22222222-2222-2222-2222-222222222222', '§18A-6',  'Minimum landscaped area', 'Minimum 15% of net lot area landscaped (residential) or 10% (commercial/mixed-use).', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-7',  'Street trees', 'Street trees every 30 LF of frontage; min 2" caliper at planting; from approved species list.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-8',  'Native species', 'At least 50% of required plants must be Florida-native species.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-9',  'Parking lot landscaping', 'Parking lots require 1 shade tree per 10 spaces; 5% of parking area landscaped; tree islands min 5''x8''.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-10', 'Buffer yards', 'Buffer yards between residential and non-residential: Type B (5 ft) or Type C (10 ft).', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-11', 'Irrigation', 'All landscaped areas require automatic irrigation with rain sensor.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-12', 'Tree removal permit', 'Tree removal of trees >=4" DBH requires DERM permit before any land clearing.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-13', 'Screening hedges', 'Screening hedges min 3 ft at planting; reach 4 ft within 18 months.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-14', 'Ground cover establishment', 'Ground cover/sod established within 30 days of Certificate of Occupancy.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', '§18A-15', 'Preserved tree credit', 'Preserved native trees receive landscaping credit.', 'landscape');

-- Miami 21 — Transect standards ----------------------------------------------
insert into municipality_rules (municipality_id, code, title, description, category) values
  ('11111111-1111-1111-1111-111111111111', 'Miami21-T3', 'T3 Sub-Urban', 'Min 60% of lot frontage as landscaped setback; 1 tree per 3,000 SF of lot; no parking in front setback.', 'landscape'),
  ('11111111-1111-1111-1111-111111111111', 'Miami21-T4', 'T4 General Urban', 'Min 30% of frontage landscaped; 1 canopy tree per 40 LF of frontage; lawn panels min 4 ft wide.', 'landscape'),
  ('11111111-1111-1111-1111-111111111111', 'Miami21-T5', 'T5 Urban Center', 'Street trees at 20-40 ft spacing; tree grates where sidewalk <8 ft.', 'landscape'),
  ('11111111-1111-1111-1111-111111111111', 'Miami21-T6', 'T6 Urban Core', 'Street trees min 1 per 25 LF; continuous canopy on primary frontages; structured soil min 3 ft depth.', 'landscape'),
  ('11111111-1111-1111-1111-111111111111', 'Miami21-CS', 'Civic Space', 'Min 50% open/green space; canopy covering >=30% of site; impervious surface <=40%.', 'landscape'),
  ('11111111-1111-1111-1111-111111111111', 'Miami21-ST', 'Sight triangle', 'No planting >30" within 10 ft of driveway/intersection; mulch min 3" depth; root barriers within 5 ft of paving.', 'landscape');

-- DERM — Tree preservation ----------------------------------------------------
insert into municipality_rules (municipality_id, code, title, description, category) values
  ('22222222-2222-2222-2222-222222222222', 'DERM-001', 'Protected trees', 'Trees >=4" DBH are protected; removal requires DERM Tree Removal Permit.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-002', 'Heritage trees', 'Heritage trees >=18" DBH require public notice and Board approval for removal.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-003', 'Replacement ratio', 'Replacement ratio: 1" DBH removed = 1" DBH replanted (on-site or mitigation fund).', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-004', 'Arborist survey', 'Certified arborist tree survey required with permit application if any trees >=4" DBH on site.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-005', 'Tree protection zone', 'TPZ: no construction within 1 ft per inch DBH (min 5 ft); TPZ fencing before any site work.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-006', 'Invasive removal', 'Invasive removal (Brazilian pepper, Australian pine, melaleuca) exempt from permit; counts as replacement credit.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-007', 'Mangrove protection', 'Mangrove trimming requires DERM permit + DEP notification; removal prohibited without variance.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-008', 'ESL overlay', 'ESL overlay areas require additional environmental review and may require 25% upland buffer.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-009', 'Prohibited species', 'FLEPPC Category I or II invasive species prohibited in any landscape plan.', 'landscape'),
  ('22222222-2222-2222-2222-222222222222', 'DERM-010', 'Post-construction monitoring', 'If tree mitigation required, 1-year arborist monitoring report must be submitted post-construction.', 'landscape');
