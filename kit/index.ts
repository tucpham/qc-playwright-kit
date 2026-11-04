/**
 * QC Playwright Kit - shared core.
 * Owned by QC. Projects must not edit files in kit/; propose changes to the kit owners instead.
 * Target: publish this folder as an internal package (e.g. @company/qc-playwright-kit).
 */
export const KIT_VERSION = '1.0.0';

export * from './project';
export * from './env';
export * from './fixtures';
export * from './auth';
export * from './tags';
export { createConfig } from './config/createConfig';
export { BasePage } from './components/BasePage';
export { Toast } from './components/Toast';
export { DataTable } from './components/DataTable';
export { fillForm, type FieldValue } from './components/form';
