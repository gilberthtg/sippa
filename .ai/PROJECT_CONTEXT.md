# SIPPA Project Context

## Product
SiPPA — Sistem Informasi Permintaan Pengembangan Aplikasi.

## Purpose
Web application for centralized submission, recording, workflow management, progress monitoring, quarterly reporting, and SLA reporting for application-development requests handled by DevTI.

## Source Baseline
Primary business baseline: `CP - Gambaran Aplikasi SIPPA.pdf` provided for this project.

## Scope v1.0
- Request Baru: submit New Application or RFC.
- DevTI Request: user monitors own requests; admin manages all requests; developer handles assigned requests and updates progress.
- Laptri: automatic quarterly report of completed requests.
- Pencapaian SLA: actual handling time compared with target SLA per request.

## Actors
- User
- Admin
- Developer

## Technology Baseline
- Next.js
- TypeScript
- MySQL

## UI Direction
- Soft, calm, comfortable visual language.
- Primary color: green.
- UX must be prioritized over visual decoration.
- Favor clear hierarchy, progressive disclosure, obvious status, low cognitive load, responsive layouts, accessible contrast, and consistent feedback.

## Current Status
Project planning / initial setup.

## Open Questions
- Authentication/SSO mechanism: [NEEDS_DECISION]
- Exact master-data source for users/units/developers: [NEEDS_DECISION]
- Exact SLA target rules by request type/priority: [NEEDS_DECISION]
- File storage mechanism and allowed file types/size: [NEEDS_DECISION]
- Notification channels: [NEEDS_DECISION]
