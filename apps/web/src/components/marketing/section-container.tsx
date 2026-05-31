import { cn } from '@/lib/utils'

interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function SectionContainer({ children, className, id }: SectionContainerProps) {
  return (
    <div id={id} className={cn('max-w-6xl mx-auto px-6 md:px-8 lg:px-12', className)}>
      {children}
    </div>
  )
}
