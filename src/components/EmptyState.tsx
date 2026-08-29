export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><p>{title}</p><span>{description}</span></div>;
}
