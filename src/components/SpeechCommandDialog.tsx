import * as Dialog from '@radix-ui/react-dialog';

interface Props {
  speechCommandActivated: number;
}

export default function SpeechCommandDialog({ speechCommandActivated }: Props) {
  const style =
    speechCommandActivated === 0
      ? {}
      : speechCommandActivated === 1 || speechCommandActivated === 4
        ? { backgroundColor: '#4CBB17', width: '100%', height: '100%', opacity: 0.5 }
        : speechCommandActivated === 2
          ? { backgroundColor: '#FFBF00', width: '100%', height: '100%', opacity: 0.5 }
          : speechCommandActivated === 3
            ? { backgroundColor: '#D22B2B', width: '100%', height: '100%', opacity: 0.5 }
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

