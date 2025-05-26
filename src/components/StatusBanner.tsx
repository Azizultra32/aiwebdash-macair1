interface Props {
  status: string;
  speechStatus: string;
  isOnline: boolean;
}

export default function StatusBanner({ status, speechStatus, isOnline }: Props) {
  return (
    <span>{`${status} ${speechStatus} ${isOnline ? '(Online)' : '(Offline)'}`}</span>
  );
}

