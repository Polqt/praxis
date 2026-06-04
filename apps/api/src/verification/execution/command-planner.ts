import type { RepositoryIngestionData } from '../ingestion/repository-ingestion.types'
import { SAFE_NPM_SCRIPTS } from './execution.constants'

export type ExecutionPhase = 'install' | 'test' | 'build' | 'lint' | 'typecheck' | 'doctor'

export interface PlannedCommand {
  phase: ExecutionPhase
  command: string
  label: string
}

export interface ExecutionPlan {
  language: string
  framework: string
  commands: PlannedCommand[]
}

type PackageJson = {
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

function filePaths(data: RepositoryIngestionData): string[] {
  return data.files.map((f) => f.path)
}

function hasPath(paths: string[], name: string): boolean {
  return paths.some((path) => path === name || path.endsWith(`/${name}`))
}

function getPackageJson(data: RepositoryIngestionData): PackageJson | null {
  const file = data.files.find((f) => f.path === 'package.json' || f.path.endsWith('/package.json'))
  if (!file?.content) return null
  try {
    return JSON.parse(file.content) as PackageJson
  } catch {
    return null
  }
}

function deps(pkg: PackageJson | null): Record<string, string> {
  return { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) }
}

function hasDep(pkg: PackageJson | null, names: string[]): boolean {
  const allDeps = deps(pkg)
  return names.some((name) => name in allDeps)
}

function hasSafeScript(pkg: PackageJson | null, script: string): boolean {
  if (!SAFE_NPM_SCRIPTS.has(script)) return false
  const command = pkg?.scripts?.[script]
  if (!command) return false
  return !/curl|wget|nc\s|netcat|ssh|scp|sudo|rm\s+-rf/i.test(command)
}

function npmCommand(pkg: PackageJson | null, phase: ExecutionPhase, fallback: string | null): PlannedCommand | null {
  if (hasSafeScript(pkg, phase)) {
    return { phase, command: `npm run ${phase}`, label: `npm run ${phase}` }
  }
  if (!fallback) return null
  return { phase, command: fallback, label: fallback }
}

export function planExecution(data: RepositoryIngestionData): ExecutionPlan | null {
  const paths = filePaths(data)
  const pkg = getPackageJson(data)

  if (hasPath(paths, 'manage.py')) {
    return {
      language: 'python',
      framework: 'django',
      commands: [
        ...(hasPath(paths, 'requirements.txt') ? [{ phase: 'install' as const, command: 'pip install -r requirements.txt', label: 'pip install -r requirements.txt' }] : []),
        { phase: 'test', command: 'python manage.py test', label: 'python manage.py test' },
      ],
    }
  }

  if (pkg && (hasDep(pkg, ['expo']) || hasPath(paths, 'app.json') || hasPath(paths, 'app.config.js') || hasPath(paths, 'app.config.ts'))) {
    return {
      language: 'typescript',
      framework: 'expo',
      commands: [
        { phase: 'install', command: 'npm install --no-fund --no-audit', label: 'npm install' },
        { phase: 'doctor', command: 'npx expo-doctor', label: 'npx expo-doctor' },
        ...(hasSafeScript(pkg, 'test') ? [{ phase: 'test' as const, command: 'npm test', label: 'npm test' }] : []),
      ],
    }
  }

  if (pkg && (hasDep(pkg, ['@nestjs/core', '@nestjs/common']) || hasPath(paths, 'nest-cli.json'))) {
    return {
      language: 'typescript',
      framework: 'nestjs',
      commands: [
        { phase: 'install', command: 'npm install --no-fund --no-audit', label: 'npm install' },
        ...(npmCommand(pkg, 'test', null) ? [npmCommand(pkg, 'test', null)!] : []),
        ...(npmCommand(pkg, 'build', null) ? [npmCommand(pkg, 'build', null)!] : []),
        ...(npmCommand(pkg, 'lint', null) ? [npmCommand(pkg, 'lint', null)!] : []),
        ...(npmCommand(pkg, 'typecheck', null) ? [npmCommand(pkg, 'typecheck', null)!] : []),
      ],
    }
  }

  if (pkg) {
    const isTypeScript = hasPath(paths, 'tsconfig.json') || hasPath(paths, 'tsconfig.base.json') || hasDep(pkg, ['typescript'])
    const testFallback = hasDep(pkg, ['vitest'])
      ? 'npx vitest run --passWithNoTests'
      : hasDep(pkg, ['jest', 'ts-jest', 'babel-jest'])
        ? 'npx jest --passWithNoTests'
        : hasDep(pkg, ['mocha'])
          ? 'npx mocha'
          : null

    const commands = [
      { phase: 'install' as const, command: 'npm install --no-fund --no-audit', label: 'npm install' },
      ...(npmCommand(pkg, 'test', testFallback) ? [npmCommand(pkg, 'test', testFallback)!] : []),
      ...(npmCommand(pkg, 'build', null) ? [npmCommand(pkg, 'build', null)!] : []),
      ...(npmCommand(pkg, 'lint', null) ? [npmCommand(pkg, 'lint', null)!] : []),
      ...(npmCommand(pkg, 'typecheck', isTypeScript ? 'npx tsc --noEmit' : null) ? [npmCommand(pkg, 'typecheck', isTypeScript ? 'npx tsc --noEmit' : null)!] : []),
    ]

    return {
      language: isTypeScript ? 'typescript' : 'javascript',
      framework: 'node',
      commands,
    }
  }

  if (hasPath(paths, 'requirements.txt') || hasPath(paths, 'pyproject.toml') || hasPath(paths, 'setup.py')) {
    return {
      language: 'python',
      framework: 'python',
      commands: [
        ...(hasPath(paths, 'requirements.txt') ? [{ phase: 'install' as const, command: 'pip install -r requirements.txt', label: 'pip install -r requirements.txt' }] : []),
        { phase: 'test', command: 'python -m pytest --tb=no -q', label: 'python -m pytest' },
      ],
    }
  }

  if (hasPath(paths, 'go.mod')) {
    return { language: 'go', framework: 'go', commands: [{ phase: 'test', command: 'go test ./...', label: 'go test ./...' }] }
  }

  if (hasPath(paths, 'Cargo.toml')) {
    return { language: 'rust', framework: 'rust', commands: [{ phase: 'test', command: 'cargo test', label: 'cargo test' }] }
  }

  return null
}
