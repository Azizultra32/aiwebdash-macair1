import { cn } from '@/lib/utils';

type Props = {
  size?: 'small' | 'medium' | 'large' | 'xsmall';
  position?: 'fullscreen' | 'auto' | 'overlay';
  variant?: 'light' | 'dark';
};

const Loading = ({ size = 'medium', position = 'auto', variant }: Props) => {
  const classesPostion = cn('flex items-center justify-center', {
    'w-full h-screen inset-0 fixed': position === 'fullscreen',
    'w-full h-full absolute top-0 left-0 z-50': position === 'overlay',
  });

  const classesSize = cn({
    'w-4 h-4': size === 'xsmall',
    'w-5 h-5': size === 'small',
    'w-8 h-8': size === 'medium',
    'w-10 h-10': size === 'large',
  });

  const classesVariant = cn({
    'text-background': variant === 'light',
    'text-foreground': variant === 'dark',
  });

  const classesIcons = cn(classesSize, classesVariant);

  return (
    <span className={classesPostion}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={classesIcons}
        stroke="currentColor"
      >
        <g className="loading stroke-current">
          <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth={2} />
        </g>
      </svg>
    </span>
  );
};

export { Loading };
