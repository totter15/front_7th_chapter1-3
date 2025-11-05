import { FormControl, Tooltip, TextField, FormLabel } from '@mui/material';

interface InputFormProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | boolean | null;
  type?: 'text' | 'date' | 'time';
  fullWidth?: boolean;
}

const InputForm = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  fullWidth = true,
}: InputFormProps) => {
  const hasError = !!error;
  const errorMessage = typeof error === 'string' ? error : '';

  const textField = (
    <TextField
      id={id}
      size="small"
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={hasError}
    />
  );

  return (
    <FormControl fullWidth={fullWidth}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      {hasError ? (
        <Tooltip title={errorMessage} open={hasError} placement="top">
          {textField}
        </Tooltip>
      ) : (
        textField
      )}
    </FormControl>
  );
};

export default InputForm;
