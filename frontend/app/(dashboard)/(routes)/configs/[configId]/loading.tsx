import { Loader2 } from 'lucide-react';

export default function ConfigLoading() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

