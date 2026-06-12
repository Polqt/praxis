'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconArrowUpRight, IconArrowRight } from '@tabler/icons-react'
import { staggerContainer, fadeUp } from '@/lib/animations'
import { SECTION_LABEL_CLASS } from '@/features/reports/constants'
import { categorySlug } from '@/features/reports/utils/category-slug'

function extractCategory(text: string, categories: string[]): string | null {
  const lower = text.toLowerCase()
  return categories.find((c) => lower.includes(c.toLowerCase())) ?? null
}

type ItemListProps = {
  items: string[]
  icon: React.ReactNode
  categories: string[]
}

function ItemList({ items, icon, categories }: ItemListProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => {
        const cat = extractCategory(item, categories)
        return (
          <div key={i} className="flex items-start gap-2">
            {icon}
            {cat ? (
              <Link href={`#${categorySlug(cat)}`} className="text-sm hover:underline underline-offset-2">
                {item}
              </Link>
            ) : (
              <span className="text-sm">{item}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

type Props = {
  strengths: string[]
  improvements: string[]
  derived: boolean
  categories?: string[]
}

export function StrengthsImprovementsSection({ strengths, improvements, derived, categories = [] }: Props) {
  const hasStrengths = strengths.length > 0
  const hasImprovements = improvements.length > 0

  if (!hasStrengths && !hasImprovements) return null

  const colCount = hasStrengths && hasImprovements ? 2 : 1

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 ${colCount === 2 ? 'md:grid-cols-2' : ''} gap-8`}
    >
      {hasStrengths && (
        <motion.div variants={fadeUp}>
          <p className={`${SECTION_LABEL_CLASS} mb-1`}>Strengths</p>
          {derived && <p className="text-xs text-muted-foreground mb-3">Derived from rubric results</p>}
          {!derived && <div className="mb-3" />}
          <ItemList
            items={strengths}
            icon={<IconArrowUpRight size={14} className="text-green-500 shrink-0 mt-0.5" strokeWidth={2} />}
            categories={categories}
          />
        </motion.div>
      )}
      {hasImprovements && (
        <motion.div variants={fadeUp}>
          <p className={`${SECTION_LABEL_CLASS} mb-1`}>{hasStrengths ? 'Improvements' : 'Areas to improve'}</p>
          {derived && <p className="text-xs text-muted-foreground mb-3">Derived from rubric results</p>}
          {!derived && <div className="mb-3" />}
          <ItemList
            items={improvements}
            icon={<IconArrowRight size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />}
            categories={categories}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
