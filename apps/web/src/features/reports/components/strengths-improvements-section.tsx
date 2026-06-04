'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconArrowUpRight, IconArrowRight } from '@tabler/icons-react'
import { staggerContainer, fadeUp } from '@/lib/animations'

function categorySlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function extractCategory(text: string, categories: string[]): string | null {
  const lower = text.toLowerCase()
  return categories.find((c) => lower.includes(c.toLowerCase())) ?? null
}

type ItemListProps = {
  items: string[]
  icon: React.ReactNode
  empty: string
  categories: string[]
}

function ItemList({ items, icon, empty, categories }: ItemListProps) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => {
        const cat = extractCategory(item, categories)
        return (
          <div key={i} className="flex items-start gap-2">
            {icon}
            {cat ? (
              <Link
                href={`#${categorySlug(cat)}`}
                className="text-sm hover:underline underline-offset-2"
              >
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
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={fadeUp} className="rounded-lg border bg-card p-5">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Strengths</p>
        {derived && <p className="text-[11px] text-muted-foreground mb-3">Derived from rubric results</p>}
        {!derived && <div className="mb-3" />}
        <ItemList
          items={strengths}
          icon={<IconArrowUpRight size={14} className="text-green-500 shrink-0 mt-0.5" strokeWidth={2} />}
          empty="None identified."
          categories={categories}
        />
      </motion.div>
      <motion.div variants={fadeUp} className="rounded-lg border bg-card p-5">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Improvements</p>
        {derived && <p className="text-[11px] text-muted-foreground mb-3">Derived from rubric results</p>}
        {!derived && <div className="mb-3" />}
        <ItemList
          items={improvements}
          icon={<IconArrowRight size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />}
          empty="None identified."
          categories={categories}
        />
      </motion.div>
    </motion.div>
  )
}
