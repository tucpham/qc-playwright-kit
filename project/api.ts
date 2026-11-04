import { expect, type APIRequestContext } from '@playwright/test';
import type { Credentials } from '../kit';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdBy: string;
}

/**
 * Test data client. Use the API (not the UI) to create and clean up data:
 * it is faster, more stable and keeps each test focused on the one flow it checks.
 * Ask dev for test-only endpoints/seed scripts if the public API is not enough.
 */
export class TasksApi {
  private token = '';

  constructor(private readonly request: APIRequestContext) {}

  private get headers() {
    return { authorization: `Bearer ${this.token}` };
  }

  async login({ username, password }: Credentials): Promise<void> {
    const res = await this.request.post('/api/login', { data: { username, password } });
    expect(res, 'API login failed').toBeOK();
    this.token = (await res.json()).token;
  }

  async createTask(title: string): Promise<Task> {
    const res = await this.request.post('/api/todos', { data: { title }, headers: this.headers });
    expect(res, `create task "${title}"`).toBeOK();
    return res.json();
  }

  async getTask(id: string): Promise<Task | null> {
    const res = await this.request.get(`/api/todos/${id}`, { headers: this.headers });
    if (res.status() === 404) return null;
    expect(res).toBeOK();
    return res.json();
  }

  async listTasks(): Promise<Task[]> {
    const res = await this.request.get('/api/todos', { headers: this.headers });
    expect(res).toBeOK();
    return res.json();
  }

  /** Safe to call in cleanup even if the task was never created or already deleted. */
  async deleteTaskByTitle(title: string): Promise<void> {
    for (const task of (await this.listTasks()).filter((t) => t.title === title)) {
      const res = await this.request.delete(`/api/todos/${task.id}`, { headers: this.headers });
      expect([204, 404]).toContain(res.status());
    }
  }
}
