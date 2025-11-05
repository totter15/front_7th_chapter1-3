import { FormControl, FormControlLabel, Checkbox } from '@mui/material';

interface CheckboxFormProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  fullWidth?: boolean;
}

const CheckboxForm = ({ checked, onChange, label, fullWidth = false }: CheckboxFormProps) => {
  return (
    <FormControl fullWidth={fullWidth}>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />}
        label={label}
      />
    </FormControl>
  );
};

export default CheckboxForm;

