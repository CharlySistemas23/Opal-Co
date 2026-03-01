export const flags = {
  adminEnabled: true,
  customerAccountsEnabled: true,
  emailMarketingEnabled: true,
} as const;

export type FlagKey = keyof typeof flags;
