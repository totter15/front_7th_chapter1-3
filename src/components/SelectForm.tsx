import { FormControl, FormLabel, Select, MenuItem } from '@mui/material';

interface SelectOption {
  value: string | number;
  label: string;
  ariaLabel?: string;
}

interface SelectFormProps {
  id?: string;
  label: string;
  labelId?: string;
  value: string | number;
  onChange: (_value: string | number) => void;
  options: SelectOption[];
  ariaLabel?: string;
  fullWidth?: boolean;
}

const SelectForm = ({
  id,
  label,
  labelId,
  value,
  onChange,
  options,
  ariaLabel,
  fullWidth = true,
}: SelectFormProps) => {
  return (
    <FormControl fullWidth={fullWidth}>
      <FormLabel id={labelId}>{label}</FormLabel>
      <Select
        id={id}
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        aria-labelledby={labelId}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            aria-label={option.ariaLabel || `${option.value}-option`}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectForm;
