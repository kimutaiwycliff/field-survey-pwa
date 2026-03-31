export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-10 h-10' }[size]
  return (
    <div className="flex items-center justify-center">
      <span
        className={`${dim} rounded-full border-2 animate-spin`}
        style={{ borderColor: 'var(--border-mid)', borderTopColor: 'var(--accent)' }}
      />
    </div>
  )
}
