-- Create database (run this manually in PostgreSQL)
CREATE DATABASE expense_tracker;

-- Create user (optional, for security)
CREATE USER expense_user WITH ENCRYPTED PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;

-- Connect to the database and grant schema permissions
\c expense_tracker;
GRANT ALL ON SCHEMA public TO expense_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO expense_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO expense_user;
