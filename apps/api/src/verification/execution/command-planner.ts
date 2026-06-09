import type { RepositoryIngestionData } from '../ingestion/repository-ingestion.types'
import { SAFE_NPM_SCRIPTS } from './execution.constants'

export type ExecutionPhase = 'install' | 'test' | 'build' | 'lint' | 'typecheck' | 'doctor'

export interface PlannedCommand {
  phase: ExecutionPhase
  command: string
  label: string
  cwd?: string
}

export interface ExecutionPlan {
  language: string
  framework: string
  workingDirectory: string
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

function dirname(path: string): string {
  const index = path.lastIndexOf('/')
  return index === -1 ? '.' : path.slice(0, index)
}

function hasPath(paths: string[], name: string): boolean {
  return paths.some((path) => path === name || path.endsWith(`/${name}`))
}

function getPackageJson(data: RepositoryIngestionData): { pkg: PackageJson; directory: string } | null {
  const candidates = data.files
    .filter((f) => f.path === 'package.json' || f.path.endsWith('/package.json'))
    .sort((a, b) => {
      if (a.path === 'package.json') return -1
      if (b.path === 'package.json') return 1
      return a.path.localeCompare(b.path)
    })

  const file = candidates[0]
  if (!file?.content) return null
  try {
    return { pkg: JSON.parse(file.content) as PackageJson, directory: dirname(file.path) }
  } catch {
    return null
  }
}

type PackageManager = {
  name: 'npm' | 'pnpm' | 'yarn' | 'bun'
  install: string
  run: (script: string) => string
  exec: (command: string) => string
}

function detectPackageManager(paths: string[], directory: string): PackageManager {
  const ancestors = directory === '.'
    ? ['.']
    : ['.', ...directory.split('/').map((_, index, parts) => parts.slice(0, index + 1).join('/'))]
  const hasLock = (name: string) => ancestors.some((dir) => paths.includes(dir === '.' ? name : `${dir}/${name}`))

  if (hasLock('bun.lock') || hasLock('bun.lockb')) {
    return { name: 'bun', install: 'bun install', run: (script) => `bun run ${script}`, exec: (command) => `bunx ${command}` }
  }
  if (hasLock('pnpm-lock.yaml')) {
    return {
      name: 'pnpm',
      install: 'corepack enable && pnpm install --frozen-lockfile=false',
      run: (script) => `pnpm run ${script}`,
      exec: (command) => `pnpm exec ${command}`,
    }
  }
  if (hasLock('yarn.lock')) {
    return { name: 'yarn', install: 'corepack enable && yarn install', run: (script) => `yarn ${script}`, exec: (command) => `yarn ${command}` }
  }
  return { name: 'npm', install: 'npm install --no-fund --no-audit', run: (script) => `npm run ${script}`, exec: (command) => `npx ${command}` }
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

function packageCommand(
  pkg: PackageJson | null,
  pm: PackageManager,
  phase: ExecutionPhase,
  fallback: string | null,
  cwd: string,
): PlannedCommand | null {
  if (hasSafeScript(pkg, phase)) {
    const command = pm.run(phase)
    return { phase, command, label: command, cwd }
  }
  if (!fallback) return null
  return { phase, command: fallback, label: fallback, cwd }
}

export function planExecution(data: RepositoryIngestionData): ExecutionPlan | null {
  const paths = filePaths(data)
  const packageInfo = getPackageJson(data)
  const pkg = packageInfo?.pkg ?? null
  const workingDirectory = packageInfo?.directory ?? '.'
  const packageManager = detectPackageManager(paths, workingDirectory)

  if (hasPath(paths, 'manage.py')) {
    return {
      language: 'python',
      framework: 'django',
      workingDirectory: '.',
      commands: [
        ...(hasPath(paths, 'requirements.txt') ? [{ phase: 'install' as const, command: 'pip install -r requirements.txt', label: 'pip install -r requirements.txt', cwd: '.' }] : []),
        { phase: 'test', command: 'python manage.py test', label: 'python manage.py test', cwd: '.' },
      ],
    }
  }

  if (pkg && (hasDep(pkg, ['expo']) || hasPath(paths, 'app.json') || hasPath(paths, 'app.config.js') || hasPath(paths, 'app.config.ts'))) {
    return {
      language: 'typescript',
      framework: 'expo',
      workingDirectory,
      commands: [
        { phase: 'install', command: packageManager.install, label: `${packageManager.name} install`, cwd: workingDirectory },
        { phase: 'doctor', command: packageManager.exec('expo-doctor'), label: `${packageManager.name} exec expo-doctor`, cwd: workingDirectory },
        ...(hasSafeScript(pkg, 'test') ? [{ phase: 'test' as const, command: packageManager.run('test'), label: packageManager.run('test'), cwd: workingDirectory }] : []),
      ],
    }
  }

  if (pkg && (hasDep(pkg, ['@nestjs/core', '@nestjs/common']) || hasPath(paths, 'nest-cli.json'))) {
    return {
      language: 'typescript',
      framework: 'nestjs',
      workingDirectory,
      commands: [
        { phase: 'install', command: packageManager.install, label: `${packageManager.name} install`, cwd: workingDirectory },
        ...([
          packageCommand(pkg, packageManager, 'test', null, workingDirectory),
          packageCommand(pkg, packageManager, 'build', null, workingDirectory),
          packageCommand(pkg, packageManager, 'lint', null, workingDirectory),
          packageCommand(pkg, packageManager, 'typecheck', null, workingDirectory),
        ].filter((c): c is PlannedCommand => c !== null)),
      ],
    }
  }

  if (pkg) {
    const isTypeScript = hasPath(paths, 'tsconfig.json') || hasPath(paths, 'tsconfig.base.json') || hasDep(pkg, ['typescript'])
    const testFallback = hasDep(pkg, ['vitest'])
      ? packageManager.exec('vitest run --passWithNoTests')
      : hasDep(pkg, ['jest', 'ts-jest', 'babel-jest'])
        ? packageManager.exec('jest --passWithNoTests')
        : hasDep(pkg, ['mocha'])
          ? packageManager.exec('mocha')
          : null

    const typecheckFallback = isTypeScript ? packageManager.exec('tsc --noEmit') : null
    const commands = [
      { phase: 'install' as const, command: packageManager.install, label: `${packageManager.name} install`, cwd: workingDirectory },
      ...([
        packageCommand(pkg, packageManager, 'test', testFallback, workingDirectory),
        packageCommand(pkg, packageManager, 'build', null, workingDirectory),
        packageCommand(pkg, packageManager, 'lint', null, workingDirectory),
        packageCommand(pkg, packageManager, 'typecheck', typecheckFallback, workingDirectory),
      ].filter((c): c is PlannedCommand => c !== null)),
    ]

    return {
      language: isTypeScript ? 'typescript' : 'javascript',
      framework: 'node',
      workingDirectory,
      commands,
    }
  }

  if (hasPath(paths, 'requirements.txt') || hasPath(paths, 'pyproject.toml') || hasPath(paths, 'setup.py')) {
    return {
      language: 'python',
      framework: 'python',
      workingDirectory: '.',
      commands: [
        ...(hasPath(paths, 'requirements.txt') ? [{ phase: 'install' as const, command: 'pip install -r requirements.txt', label: 'pip install -r requirements.txt', cwd: '.' }] : []),
        { phase: 'test', command: 'python -m pytest --tb=no -q', label: 'python -m pytest', cwd: '.' },
      ],
    }
  }

  if (hasPath(paths, 'go.mod')) {
    return { language: 'go', framework: 'go', workingDirectory: '.', commands: [{ phase: 'test', command: 'go test ./...', label: 'go test ./...', cwd: '.' }] }
  }

  if (hasPath(paths, 'Cargo.toml')) {
    return { language: 'rust', framework: 'rust', workingDirectory: '.', commands: [{ phase: 'test', command: 'cargo test', label: 'cargo test', cwd: '.' }] }
  }

  return null
}
