import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog"

interface Props {
  speechCommandActivated: number;
}

export default function SpeechCommandDialog({ speechCommandActivated }: Props) {
  const style =
    speechCommandActivated === 0
      ? {}
      : speechCommandActivated === 1 || speechCommandActivated === 4
        ? { backgroundColor: 'hsl(var(--success))', width: '100%', height: '100%', opacity: 0.5 }
        : speechCommandActivated === 2
          ? { backgroundColor: 'hsl(var(--warning))', width: '100%', height: '100%', opacity: 0.5 }
          : speechCommandActivated === 3
            ? { backgroundColor: 'hsl(var(--destructive))', width: '100%', height: '100%', opacity: 0.5 }
            : {};

  return (
    <Dialog open={speechCommandActivated !== 0}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 z-20" />
        <DialogContent
          className="fixed inset-0 border-none p-0 shadow-none"
          style={style}
        />
      </DialogPortal>
    </Dialog>
  );
}
