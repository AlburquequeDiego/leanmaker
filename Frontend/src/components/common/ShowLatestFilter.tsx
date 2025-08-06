import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { themeMode } = useTheme();

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel sx={{ color: themeMode === 'dark' ? '#cbd5e1' : '#64748b' }}>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as number)}
        sx={{ 
          bgcolor: themeMode === 'dark' ? '#334155' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#1e293b',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: themeMode === 'dark' ? '#475569' : '#d1d5db',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: themeMode === 'dark' ? '#60a5fa' : 'primary.main',
          },
          '& .MuiSvgIcon-root': {
            color: themeMode === 'dark' ? '#cbd5e1' : '#64748b',
          },
        }}
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