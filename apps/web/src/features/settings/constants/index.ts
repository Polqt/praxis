import type { SettingsSection } from '@/features/settings/types'

export const SETTINGS_NAV_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'github', label: 'GitHub' },
  { id: 'danger', label: 'Danger Zone' },
]

export const SETTINGS_SECTION_HEADERS: Record<
  SettingsSection,
  { title: string; subtitle: string }
> = {
  account: {
    title: 'Account',
    subtitle: 'Manage your email address and public username.',
  },
  github: {
    title: 'GitHub verification access',
    subtitle:
      'This connection is used to analyze repositories for project verification — it is separate from your sign-in method.',
  },
  danger: {
    title: 'Danger zone',
    subtitle: 'Irreversible actions. Proceed carefully.',
  },
}

export const PROFILE_URL_COPY_RESET_MS = 1500
export const SIGN_OUT_ERROR_MESSAGE = 'Sign out failed. Please try again.'
