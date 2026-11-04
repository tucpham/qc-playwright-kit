import { test as setup } from '@playwright/test';
import { defineAuthSetup } from '../kit';
import project from '../project/project.config';

// Logs in once per role and saves the session to .auth/<role>.json
defineAuthSetup(setup, project);
