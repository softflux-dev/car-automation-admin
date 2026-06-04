import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ButtonLoader({ loading, label, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
    </Button>
  );
}
