const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using Praxis you agree to be bound by these Terms of Service. If you do not agree to these terms do not use the service.',
  },
  {
    title: 'Description of Service',
    body: 'Praxis is a proof-of-work platform that allows developers to connect their GitHub accounts, submit repositories for verification, and receive independent verification reports. Praxis uses automated analysis and AI-assisted review to evaluate submitted repositories.',
  },
  {
    title: 'User Accounts',
    body: 'You are responsible for maintaining the security of your account credentials. You must not share your account with others or use another person\'s account. You must provide accurate information when creating your account.',
  },
  {
    title: 'GitHub Integration',
    body: 'When you connect your GitHub account you grant Praxis read-only access to the specific repositories you choose to submit for verification. Praxis does not access repositories you have not explicitly submitted. You can revoke access at any time from your GitHub settings.',
  },
  {
    title: 'Proof Pages',
    body: 'Upon successful verification your proof page at praxis.dev/p/username is made publicly accessible. You may share this URL freely. Praxis does not guarantee permanent availability of proof pages but will provide reasonable notice before removing any verified content.',
  },
  {
    title: 'Prohibited Use',
    body: 'You may not use Praxis to submit repositories you did not meaningfully author. You may not attempt to game or manipulate the verification system. You may not use Praxis for any unlawful purpose.',
  },
  {
    title: 'Limitation of Liability',
    body: 'Praxis is provided as is without warranties of any kind. We are not liable for any indirect or consequential damages arising from your use of the service.',
  },
  {
    title: 'Changes to Terms',
    body: 'We reserve the right to modify these terms at any time. We will notify users of significant changes via email. Continued use of Praxis after changes constitutes acceptance of the new terms.',
  },
  {
    title: 'Contact',
    body: 'Questions about these terms can be sent to legal@praxis.dev.',
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Terms of Service
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
