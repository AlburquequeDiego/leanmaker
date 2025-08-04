import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface ShowLatestFilterProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  options?: number[];
}

export const ShowLatestFilter: React.FC<ShowLatestFilterProps> = ({
  value,
  onChange,
  label = "Mostrar",
  options = [5, 10, 20, 30, 50]
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as number)}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option === -1 ? 'Todas' : `${option} últimos`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 