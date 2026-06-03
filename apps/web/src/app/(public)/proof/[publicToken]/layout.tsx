// Proof pages get their own minimal layout — no site header or footer.
// The page is a shareable artifact and should look clean when linked externally.
export default function ProofLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
