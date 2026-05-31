'use client'

import { useState } from 'react'

type Section = 'account' | 'github' | 'danger'

export function useSettingsNav() {
  const [activeSection, setActiveSection] = useState<Section>('account')
  return { activeSection, setActiveSection }
}
