import { createCtx } from '@reatom/core';

export const ctx = createCtx();

export type AppCtx = typeof ctx;

export const CTX_CONFIG = {
  name: 'BosaNogaApp',
  version: '1.0.0',
} as const;