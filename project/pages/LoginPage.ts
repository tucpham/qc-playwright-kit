import { BasePage } from '../../kit';

export class LoginPage extends BasePage {
  protected readonly path = '/login';
  readonly ready = this.page.getByRole('heading', { name: 'Sign in' });

  readonly username = this.page.getByLabel('Username');
  readonly password = this.page.getByLabel('Password');
  readonly submit = this.page.getByRole('button', { name: 'Sign in' });
  readonly error = this.page.getByRole('alert');

  async signIn(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
