'use client'

import { useState } from 'react'
import type { SettingsSection } from '@/features/settings/types'

export function useSettingsNav() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  return { activeSection, setActiveSection }
}
