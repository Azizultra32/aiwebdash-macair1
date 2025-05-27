import * as Dialog from '@radix-ui/react-dialog';

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
    <Dialog.Root open={speechCommandActivated !== 0}>
      <Dialog.Trigger />
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay z-20">
          <Dialog.Content className="DialogContent" style={style} />
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

