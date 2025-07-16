import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Button,
  Stack,
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

interface DataTableProps {
  title?: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
  }[];
  loading?: boolean;
  error?: string | null;
  filters?: {
    key: string;
    label: string;
    type: 'text' | 'select';
    options?: { value: string; label: string }[];
  }[];
  onFilterChange?: (filters: any) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  showPageSizeSelector?: boolean;
  emptyMessage?: string;
  actions?: (row: any) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  columns,
  loading = false,
  error = null,
  filters = [],
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  pageSizeOptions = [5, 10, 15, 20, 25, 30, 50, 100],
  showPagination = true,
  showPageSizeSelector = true,
  emptyMessage = 'No hay datos disponibles',
  actions,
}) => {
  const [localFilters, setLocalFilters] = useState<{ [key: string]: any }>({});
  // Elimina el estado showFilters y el botón de filtros. Haz que los filtros se muestren siempre si filters.length > 0.

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(localFilters);
    }
  }, [localFilters, onFilterChange]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setLocalFilters({});
  };

  const handlePageSizeChange = (event: any) => {
    const value = event.target.value;
    if (onPageSizeChange) {
      onPageSizeChange(Number(value));
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Box>
      {/* Header con título y controles */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        {title && (
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        )}
        {/* Elimina el botón de filtros */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Selector de cantidad de resultados */}
          {showPageSizeSelector && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mostrar</InputLabel>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                label="Mostrar"
              >
                {pageSizeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {/* Filtros SIEMPRE visibles */}
      {filters.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={2}>
            {filters.map((filter) => (
              <Box key={filter.key} sx={{ minWidth: 200 }}>
                {filter.type === 'text' ? (
                  <TextField
                    size="small"
                    label={filter.label}
                    value={localFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <FormControl size="small" fullWidth>
                    <InputLabel>{filter.label}</InputLabel>
                    <Select
                      value={localFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      label={filter.label}
                    >
                      {/* Solo muestra 'Todos' si el filtro NO es pageSize/Mostrar últimas */}
                      {filter.key !== 'pageSize' && filter.label !== 'Mostrar últimas' && (
                        <MenuItem value="">Todos</MenuItem>
                      )}
                      {filter.options?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              size="small"
            >
              Limpiar
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      minWidth: column.width || 'auto',
                      whiteSpace: 'nowrap',
                      textAlign: column.align || 'left'
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell
                    align="center"
                    sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}
                  >
                    Acciones
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={row.id || index} hover>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={{
                          textAlign: column.align || 'left',
                          minWidth: column.width || 'auto'
                        }}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key] || '-'
                        }
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell align="center">
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Información de resultados */}
      {!loading && !error && data.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {data.length} de {totalCount} resultados
          </Typography>

          {/* Paginación */}
          {showPagination && totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => onPageChange?.(page)}
              color="primary"
              showFirstButton
              showLastButton
            />
          )}
        </Box>
      )}
    </Box>
  );
}; 