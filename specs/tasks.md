# Task management

Owner: QC Team
Requirement: DEMO-12 Team task list
Roles: admin, user

## TC-TASK-001 User can add a task

- Status: approved
- Priority: P1
- Tags: @smoke @regression @critical
- Role: user
- Preconditions:
  - Logged in as user
- Steps:
  1. Open the task list
  2. Type a unique title into "New task"
  3. Click "Add"
- Expected:
  - The task appears in the list, not done
  - Message: Task "<title>" added
  - The "New task" field is cleared

## TC-TASK-002 Empty title is rejected

- Status: approved
- Priority: P2
- Tags: @regression
- Role: user
- Steps:
  1. Open the task list
  2. Enter only spaces into "New task" and click "Add"
- Expected:
  - Validation message: Task title is required
  - No success message is shown

## TC-TASK-003 User can mark a task as done

- Status: approved
- Priority: P1
- Tags: @regression
- Role: user
- Preconditions:
  - A task exists (create via API)
- Steps:
  1. Open the task list
  2. Tick the checkbox of the task
- Expected:
  - The checkbox is ticked
  - The task is saved as done (check via API)

## TC-TASK-004 Admin can delete a task

- Status: approved
- Priority: P1
- Tags: @regression @critical
- Role: admin
- Preconditions:
  - A task exists (create via API)
- Steps:
  1. Open the task list
  2. Click "Delete" on the task
- Expected:
  - The task disappears from the list
  - Message: Task deleted
  - The task no longer exists in the backend (check via API)

## TC-TASK-005 Regular user cannot delete a task

- Status: approved
- Priority: P1
- Tags: @regression
- Role: user
- Preconditions:
  - A task exists (create via API)
- Steps:
  1. Open the task list
- Expected:
  - The task is visible
  - No "Delete" button is shown for the task

## TC-TASK-006 User can edit a task title

- Status: draft
- Priority: P2
- Tags: @regression
- Role: user
- Steps:
  1. Open the task list
  2. Edit the title of an existing task
- Expected:
  - [NEEDS CONFIRMATION] Feature not in DEMO-12 yet. Waiting for BA to confirm edit behavior.
