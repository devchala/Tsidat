import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocations } from "@/lib/locations";

export function LocationSelect({ value, onChange, allowed, label = "Choose location", all = false }: {
  value: string; onChange: (value: string) => void; allowed?: string[]; label?: string; all?: boolean;
}) {
  const locations = useLocations();
  const rows = (locations.data ?? []).filter((l) => !allowed || allowed.includes(l.id));
  return <Select value={value} onValueChange={onChange}>
    <SelectTrigger aria-label={label} className="w-full min-w-0"><SelectValue placeholder={label} /></SelectTrigger>
    <SelectContent>
      {all && <SelectItem value="all">All locations</SelectItem>}
      {rows.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
    </SelectContent>
  </Select>;
}