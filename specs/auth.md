# Authentication

Owner: QC Team
Requirement: DEMO-01 Login
Roles: anonymous

## TC-AUTH-001 Wrong password shows an error

- Status: approved
- Priority: P1
- Tags: @smoke @regression
- Role: anonymous
- Steps:
  1. Open /login
  2. Enter username "user" and a wrong password
  3. Click "Sign in"
- Expected:
  - Error: Invalid username or password
  - User stays on /login

## TC-AUTH-002 Logged-out user is redirected to login

- Status: approved
- Priority: P1
- Tags: @regression
- Role: anonymous
- Steps:
  1. Open / without a session
- Expected:
  - Redirected to /login
  - The Sign in page is shown
