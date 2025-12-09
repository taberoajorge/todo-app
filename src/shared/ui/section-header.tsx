interface SectionHeaderProps {
  title: string;
  count: number;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
        {count}
      </span>
    </header>
  );
}
