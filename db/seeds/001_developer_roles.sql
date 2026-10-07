-- Seed Data: Developer Roles
-- 6 specific roles for developers: SA, TW, BE, FE, QA, DM

INSERT INTO `developer_roles` (`code`, `name`, `description`, `is_active`, `sort_order`) VALUES
('SA', 'System Analyst', 'Analyze system requirements and design solutions', 1, 1),
('TW', 'Technical Writer', 'Create technical documentation and user guides', 1, 2),
('BE', 'Back End Developer', 'Develop server-side logic, APIs, and database integration', 1, 3),
('FE', 'Front End Developer', 'Develop user interface and client-side logic', 1, 4),
('QA', 'Quality Assurance', 'Test and ensure quality of applications', 1, 5),
('DM', 'Data Management', 'Manage database, data migration, and data-related tasks', 1, 6);
