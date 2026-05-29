export function LoadingState() { return <div className="state skeleton">Loading…</div>; }
export function EmptyState({ message = 'Nothing found' }: { message?: string }) { return <div className="state">{message}</div>; }
export function ErrorState({ message }: { message: string }) { return <div className="state error-state">{message}</div>; }
