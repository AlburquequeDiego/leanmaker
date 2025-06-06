import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export const LoadingButton = ({ loading, children, disabled, ...props }: LoadingButtonProps) => {
  return (
    <Button
      disabled={loading || disabled}
      {...props}
      sx={{
        position: 'relative',
        ...props.sx,
      }}
    >
      {children}
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
    </Button>
  );
};

export default LoadingButton; 