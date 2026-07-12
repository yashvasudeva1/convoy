/* badge */
type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

function resolveVariant(label: string): BadgeVariant {
  const l = label.toLowerCase();
  if (l === 'available') return 'green';
  if (l === 'on trip' || l === 'dispatched' || l === 'on duty') return 'amber';
  if (l === 'in shop' || l === 'active') return 'blue';
  if (l === 'retired' || l === 'suspended' || l === 'cancelled') return 'red';
  if (l === 'completed') return 'green';
  if (l === 'draft' || l === 'off duty') return 'gray';
  return 'gray';
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const v = variant ?? resolveVariant(label);
  return (
    <span className={`badge badge-${v}`}>{label}</span>
  );
}
