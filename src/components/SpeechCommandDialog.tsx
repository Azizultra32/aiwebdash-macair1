import { Dialog, DialogContent } from "@/components/ui/dialog";

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
          ? { backgroundColor: 'hsl(var(--accent))', width: '100%', height: '100%', opacity: 0.5 }
          : speechCommandActivated === 3
            ? { backgroundColor: 'hsl(var(--destructive))', width: '100%', height: '100%', opacity: 0.5 }
            : {};

  return (
    <Dialog open={speechCommandActivated !== 0}>
      <DialogContent className="p-0" style={style} />
    </Dialog>
  );
}
