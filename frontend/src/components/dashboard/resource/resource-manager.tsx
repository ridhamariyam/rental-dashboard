'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';

import { api } from '@/lib/api';

type FieldType = 'text' | 'email' | 'number' | 'date' | 'password' | 'select' | 'textarea';

export interface ResourceField {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  createOnly?: boolean;
  optionsEndpoint?: string;
  optionLabelKey?: string;
  optionValueKey?: string;
  options?: { label: string; value: string }[];
}

export interface ResourceColumn {
  key: string;
  label: string;
  render?: (row: ResourceRow) => React.ReactNode;
}

export type ResourceRow = Record<string, unknown> & { id: string };

interface ResourceManagerProps {
  title: string;
  endpoint: string;
  createEndpoint?: string;
  columns: ResourceColumn[];
  fields: ResourceField[];
  defaultValues: Record<string, unknown>;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function normalizeFormValue(value: string, field: ResourceField): unknown {
  if (field.type === 'number') {
    return value === '' ? 0 : Number(value);
  }

  return value;
}

function getNestedValue(row: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[part];
  }, row);
}

export function ResourceManager({
  title,
  endpoint,
  createEndpoint,
  columns,
  fields,
  defaultValues,
}: ResourceManagerProps): React.JSX.Element {
  const [rows, setRows] = React.useState<ResourceRow[]>([]);
  const [formValues, setFormValues] = React.useState<Record<string, unknown>>(defaultValues);
  const [editingRow, setEditingRow] = React.useState<ResourceRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldOptions, setFieldOptions] = React.useState<Record<string, { label: string; value: string }[]>>({});

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<ResourceRow[]>(endpoint);
      setRows(Array.isArray(data) ? data : []);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  React.useEffect(() => {
    const fieldsWithEndpoints = fields.filter((field) => field.optionsEndpoint);

    if (fieldsWithEndpoints.length === 0) {
      return;
    }

    let isMounted = true;

    async function loadFieldOptions(): Promise<void> {
      try {
        const entries = await Promise.all(
          fieldsWithEndpoints.map(async (field) => {
            const data = await api.get<ResourceRow[]>(field.optionsEndpoint as string);
            const labelKey = field.optionLabelKey ?? 'name';
            const valueKey = field.optionValueKey ?? 'id';
            const options = (Array.isArray(data) ? data : []).map((row) => ({
              label: String(getNestedValue(row, labelKey) ?? row.id),
              value: String(getNestedValue(row, valueKey) ?? row.id),
            }));

            return [field.key, options] as const;
          })
        );

        if (isMounted) {
          setFieldOptions(Object.fromEntries(entries));
        }
      } catch (error_) {
        setError(error_ instanceof Error ? error_.message : 'Unable to load form options');
      }
    }

    void loadFieldOptions();

    return () => {
      isMounted = false;
    };
  }, [fields]);

  const startCreate = (): void => {
    setEditingRow(null);
    setFormValues(defaultValues);
    setOpen(true);
  };

  const startEdit = (row: ResourceRow): void => {
    setEditingRow(row);
    setFormValues({ ...defaultValues, ...row, password: '' });
    setOpen(true);
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError(null);

    try {
      const body = Object.fromEntries(
        fields
          .filter((field) => !(editingRow && field.createOnly))
          .map((field) => [field.key, formValues[field.key]])
          .filter(([key, value]) => !(key === 'password' && value === ''))
      );

      await (editingRow
        ? api.put<ResourceRow>(`${endpoint}/${editingRow.id}`, body)
        : api.post<ResourceRow>(createEndpoint ?? endpoint, body));

      setOpen(false);
      await loadRows();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to save data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: ResourceRow): Promise<void> => {
    const confirmed = globalThis.confirm(`Delete ${title.toLowerCase()} record?`);
    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await api.delete(`${endpoint}/${row.id}`);
      await loadRows();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to delete data');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <Typography variant="h4" sx={{ flex: '1 1 auto' }}>
          {title}
        </Typography>
        <Button onClick={startCreate} startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
          Add
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.label}</TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1}>Loading...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1}>No records found</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render ? column.render(row) : formatValue(getNestedValue(row, column.key))}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => startEdit(row)}>
                          <PencilSimpleIcon fontSize="var(--icon-fontSize-md)" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => void handleDelete(row)}>
                          <TrashIcon fontSize="var(--icon-fontSize-md)" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
        <Divider />
      </Card>

      <Dialog fullWidth maxWidth="sm" onClose={() => setOpen(false)} open={open}>
        <DialogTitle>{editingRow ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {fields
              .filter((field) => !(editingRow && field.createOnly))
              .map((field) => (
                <TextField
                  fullWidth
                  key={field.key}
                  label={field.label}
                  multiline={field.type === 'textarea'}
                  onChange={(event) => {
                    setFormValues((current) => ({
                      ...current,
                      [field.key]: normalizeFormValue(event.target.value, field),
                    }));
                  }}
                  required={field.required}
                  rows={field.type === 'textarea' ? 3 : undefined}
                  select={field.type === 'select'}
                  type={field.type && field.type !== 'select' && field.type !== 'textarea' ? field.type : 'text'}
                  value={formatValue(formValues[field.key]) === '-' ? '' : String(formValues[field.key])}
                >
                  {(field.options ?? fieldOptions[field.key])?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={() => void handleSave()} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
