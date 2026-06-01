const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect your email address when you create an account. We collect GitHub username and repository metadata when you submit a project for verification. We collect usage data such as pages visited and features used to improve the product. We do not collect or store your repository source code beyond what is needed for the verification analysis.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your email to send you verification reports and important product updates. We use your GitHub data exclusively to perform the verification analysis you requested. We do not sell your personal information to third parties under any circumstances.',
  },
  {
    title: 'Data Storage',
    body: 'Your data is stored on Supabase infrastructure with encryption at rest and in transit. Verification reports are stored permanently unless you request deletion. You may delete your account and associated data at any time from your settings.',
  },
  {
    title: 'GitHub Access',
    body: 'Praxis requests read-only access scoped to repositories you explicitly submit. We do not access your private repositories unless you submit them for verification. We do not store your GitHub OAuth token beyond your active session.',
  },
  {
    title: 'Cookies',
    body: 'We use essential cookies to maintain your authenticated session. We do not use advertising or tracking cookies. We do not use third-party analytics that share your data with external parties.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. You can request a copy of all data we hold about you by contacting privacy@praxis.dev. You can revoke GitHub access from your GitHub settings at any time without affecting your Praxis account.',
  },
  {
    title: 'Contact',
    body: 'Questions about privacy can be sent to privacy@praxis.dev.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground mt-2">Last updated May 2026.</p>
      <div className="h-px bg-border my-8" />

      <div>
        {sections.map(({ title, body }) => (
          <div key={title}>
            <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">{title}</h2>
            <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
