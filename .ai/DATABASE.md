# SIPPA Database Plan

## Proposed core tables

### users
- id
- name
- email
- role_id
- unit_id
- is_active
- created_at
- updated_at

### roles
- id
- code
- name

### units
- id
- code
- name
- is_active

### requests
- id
- request_no
- request_type
- title
- description
- requester_id
- requester_unit_id
- urgency
- priority_id
- status
- submitted_at
- approved_at
- completed_at
- target_sla_hours
- created_at
- updated_at

### request_status_histories
- id
- request_id
- from_status
- to_status
- changed_by
- note
- created_at

### request_attachments
- id
- request_id
- original_name
- storage_key
- mime_type
- size_bytes
- uploaded_by
- created_at

### priorities
- id
- code
- name
- sort_order
- is_active

### teams
- id
- code
- name
- is_active

### team_members
- team_id
- user_id

### request_assignments
- id
- request_id
- team_id
- developer_id
- assigned_by
- assigned_at
- unassigned_at

### request_progress
- id
- request_id
- progress_percent
- update_note
- updated_by
- created_at

### sla_policies
- id
- request_type
- priority_id
- target_hours
- is_active

### audit_logs
- id
- actor_user_id
- entity_type
- entity_id
- action
- before_data
- after_data
- created_at

## Notes
This is a planning schema. Exact columns, indexes, enums, foreign keys, delete behavior, and SLA timing rules are to be finalized before migrations are generated.

## Reporting
Laptri and SLA reports can initially be implemented as read queries/views over transactional tables. Avoid duplicating report data unless performance requires it.
