import { CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SkillChip({ name }: { name: string }) {
  return (
    <Badge variant="outline" className="gap-1.5 text-xs">
      <CheckCircle size={11} />
      {name}
    </Badge>
  )
}
