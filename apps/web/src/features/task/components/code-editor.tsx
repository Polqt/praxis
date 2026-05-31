'use client'

import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
}

export function CodeEditor({ value, onChange, language = 'python' }: CodeEditorProps) {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg border bg-muted">
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={(val) => onChange(val ?? '')}
        theme="vs-light"
        options={{
          fontSize: 14,
          fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          padding: { top: 16, bottom: 16 },
          folding: false,
          wordWrap: 'on',
        }}
      />
    </div>
  )
}
