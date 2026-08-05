'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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

import { API_BASE_URL, api } from '@/lib/api';

type FieldType = 'text' | 'email' | 'number' | 'date' | 'password' | 'select' | 'textarea' | 'json' | 'file';

export interface ResourceField {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  createOnly?: boolean;
  readOnly?: boolean;
  multiple?: boolean;
  accept?: string;
  optionsEndpoint?: string;
  optionLabelKey?: string;
  optionLabelKeys?: string[];
  optionValueKey?: string;
  options?: { label: string; value: string }[];
}

export interface ResourceColumn {
  key: string;
  label: string;
  displayAs?: 'text' | 'gallery-count' | 'image' | 'boolean-toggle' | 'link';
  trueLabel?: string;
  falseLabel?: string;
}

export type ResourceRow = Record<string, unknown> & { id: string };

interface ResourceManagerProps {
  title: string;
  endpoint: string;
  createEndpoint?: string;
  columns: ResourceColumn[];
  fields: ResourceField[];
  defaultValues: Record<string, unknown>;
  searchableKeys?: string[];
  searchLabel?: string;
  rowLinkTemplate?: string;
  hideAddButton?: boolean;
}

function buildRowLink(template: string, row: ResourceRow): string {
  return template.replaceAll(/\{(\w+)\}/g, (match, key: string) => {
    const value = getNestedValue(row, key);
    return value === null || value === undefined ? match : String(value);
  });
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

  if (field.type === 'json') {
    if (value.trim() === '') {
      return null;
    }

    return JSON.parse(value);
  }

  return value;
}

function prepareFormValue(value: unknown, field: ResourceField): unknown {
  if (field.type === 'number') {
    if (typeof value === 'number') {
      return value;
    }

    return value === '' || value === null || value === undefined ? 0 : Number(value);
  }

  if (field.type === 'json') {
    if (typeof value === 'string') {
      if (value.trim() === '') {
        return null;
      }

      return JSON.parse(value);
    }

    return value ?? [];
  }

  return value;
}

function getFieldOptionValue(option: { label: string; value: string }): string {
  return String(option.value ?? option.label);
}

function getFieldValueAsString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function getInputValue(value: unknown, field: ResourceField): string {
  if (field.type === 'json') {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value, null, 2);
  }

  return getFieldValueAsString(value);
}

function getFilePreview(value: unknown, field: ResourceField): string {
  if (field.multiple) {
    if (!Array.isArray(value) || value.length === 0) {
      return 'No files selected';
    }

    return `${value.length} file(s) selected`;
  }

  if (typeof value === 'string' && value !== '') {
    return 'File selected';
  }

  return 'No file selected';
}

function isFileLike(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function appendFormValue(formData: FormData, key: string, value: unknown): void {
  if (value === null || value === undefined || value === '') {
    formData.append(key, '');
    return;
  }

  if (isFileLike(value)) {
    formData.append(key, value);
    return;
  }

  if (typeof value === 'object') {
    formData.append(key, JSON.stringify(value));
    return;
  }

  formData.append(key, String(value));
}

function buildRequestBody(fields: ResourceField[], formValues: Record<string, unknown>, editingRow: ResourceRow | null): FormData | Record<string, unknown> {
  const activeFields = fields.filter((field) => !(editingRow && field.createOnly) && !field.readOnly);
  const hasFileField = activeFields.some((field) => field.type === 'file');

  const entries = activeFields
    .map((field) => [field.key, prepareFormValue(formValues[field.key], field)] as const)
    .filter(([key, value]) => !(key === 'password' && value === ''));

  if (!hasFileField) {
    return Object.fromEntries(entries);
  }

  const formData = new FormData();

  for (const [key, value] of entries) {
    if (Array.isArray(value) && value.every((item) => isFileLike(item) || typeof item === 'string')) {
      for (const item of value) {
        if (isFileLike(item)) {
          formData.append(key, item);
        } else {
          formData.append(key, item);
        }
      }
      continue;
    }

    if (isFileLike(value)) {
      formData.append(key, value);
      continue;
    }

    appendFormValue(formData, key, value);
  }

  return formData;
}

function getNestedValue(row: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') {
      return;
    }

    return (current as Record<string, unknown>)[part];
  }, row);
}

function formatColumnValue(
  column: ResourceColumn,
  row: ResourceRow,
  onToggle?: (row: ResourceRow, key: string) => void,
  toggleDisabled?: boolean,
  onLinkClick?: (row: ResourceRow) => void
): React.ReactNode {
  const value = getNestedValue(row, column.key);

  if (column.displayAs === 'link') {
    return (
      <Button
        onClick={(event) => {
          event.stopPropagation();
          onLinkClick?.(row);
        }}
        size="small"
        variant="text"
      >
        {formatValue(value)}
      </Button>
    );
  }

  if (column.displayAs === 'boolean-toggle') {
    const isTrue = Boolean(value);

    return (
      <Chip
        clickable
        color={isTrue ? 'success' : 'default'}
        disabled={toggleDisabled}
        label={isTrue ? column.trueLabel ?? 'Yes' : column.falseLabel ?? 'No'}
        onClick={(event) => {
          event.stopPropagation();
          onToggle?.(row, column.key);
        }}
        size="small"
        variant={isTrue ? 'filled' : 'outlined'}
      />
    );
  }

  if (column.displayAs === 'gallery-count') {
    if (Array.isArray(value)) {
      return `${value.length} image(s)`;
    }

    return '-';
  }

  if (column.displayAs === 'image') {
    if (typeof value !== 'string' || value === '') {
      return '-';
    }

    const imageSrc =
      value.startsWith('http://') || value.startsWith('https://') ? value : `${API_BASE_URL}${value}`;

    return (
      <Box
        alt={column.label}
        component="img"
        src={imageSrc}
        sx={{
          borderRadius: 1,
          height: 48,
          objectFit: 'cover',
          width: 48,
        }}
      />
    );
  }

  return formatValue(value);
}

export function ResourceManager({
  title,
  endpoint,
  createEndpoint,
  columns,
  fields,
  defaultValues,
  searchableKeys,
  searchLabel,
  rowLinkTemplate,
  hideAddButton,
}: ResourceManagerProps): React.JSX.Element {
  const router = useRouter();
  const [rows, setRows] = React.useState<ResourceRow[]>([]);
  const [search, setSearch] = React.useState('');
  const [formValues, setFormValues] = React.useState<Record<string, unknown>>(defaultValues);
  const [editingRow, setEditingRow] = React.useState<ResourceRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldOptions, setFieldOptions] = React.useState<Record<string, { label: string; value: string }[]>>({});
  const [togglingRowId, setTogglingRowId] = React.useState<string | null>(null);

  const visibleRows = React.useMemo(() => {
    if (!searchableKeys || searchableKeys.length === 0 || search.trim() === '') {
      return rows;
    }

    const term = search.trim().toLowerCase();

    return rows.filter((row) =>
      searchableKeys.some((key) => String(getNestedValue(row, key) ?? '').toLowerCase().includes(term))
    );
  }, [rows, search, searchableKeys]);

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
              label: field.optionLabelKeys
                ? field.optionLabelKeys
                    .map((key) => getNestedValue(row, key))
                    .filter((value) => value !== null && value !== undefined && value !== '')
                    .join(' - ')
                : String(getNestedValue(row, labelKey) ?? row.id),
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

  const handleFileChange = async (field: ResourceField, files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) {
      setFormValues((current) => ({
        ...current,
        [field.key]: field.multiple ? [] : '',
      }));
      return;
    }

    const values = [...files];

    setFormValues((current) => ({
      ...current,
      [field.key]: field.multiple ? values : values[0] ?? '',
    }));
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError(null);

    try {
      const body = buildRequestBody(fields, formValues, editingRow);

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

  const handleToggleBoolean = async (row: ResourceRow, key: string): Promise<void> => {
    const previousValue = Boolean(row[key]);
    const updatedRow = { ...row, [key]: !previousValue };

    setError(null);
    setTogglingRowId(row.id);
    setRows((current) => current.map((item) => (item.id === row.id ? updatedRow : item)));

    try {
      const body = buildRequestBody(fields, updatedRow, row);
      await api.put<ResourceRow>(`${endpoint}/${row.id}`, body);
    } catch (error_) {
      setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
      setError(error_ instanceof Error ? error_.message : 'Unable to update status');
    } finally {
      setTogglingRowId(null);
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
        {searchableKeys && searchableKeys.length > 0 ? (
          <TextField
            label={searchLabel ?? 'Search'}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            value={search}
          />
        ) : null}
        {hideAddButton ? null : (
          <Button onClick={startCreate} startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Add
          </Button>
        )}
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
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1}>No records found</TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {formatColumnValue(column, row, handleToggleBoolean, togglingRowId === row.id, (linkedRow) => {
                          if (rowLinkTemplate) {
                            router.push(buildRowLink(rowLinkTemplate, linkedRow));
                          }
                        })}
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
                field.optionsEndpoint ? (
                  <Autocomplete
                    key={field.key}
                    autoHighlight
                    fullWidth
                    disabled={field.readOnly}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    noOptionsText={`No ${field.label.toLowerCase()} found`}
                    options={field.options ?? fieldOptions[field.key] ?? []}
                    onChange={(_, selectedOption) => {
                      setFormValues((current) => ({
                        ...current,
                        [field.key]: selectedOption ? getFieldOptionValue(selectedOption) : '',
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label={field.label} required={field.required} />
                    )}
                    value={
                      (field.options ?? fieldOptions[field.key] ?? []).find(
                        (option) => option.value === getFieldValueAsString(formValues[field.key])
                      ) ?? null
                    }
                  />
                ) : field.type === 'file' ? (
                  <Stack key={field.key} spacing={1}>
                    <Typography variant="subtitle2">
                      {field.label}
                      {field.required ? ' *' : ''}
                    </Typography>
                    <Button component="label" variant="outlined">
                      {field.multiple ? 'Choose files' : 'Choose file'}
                      <input
                        hidden
                        accept={field.accept}
                        multiple={field.multiple}
                        type="file"
                        onChange={(event) => {
                          void handleFileChange(field, event.target.files);
                        }}
                      />
                    </Button>
                    <Typography color="text.secondary" variant="caption">
                      {getFilePreview(formValues[field.key], field)}
                    </Typography>
                  </Stack>
                ) : (
                  <TextField
                    fullWidth
                    key={field.key}
                    label={field.label}
                    disabled={field.readOnly}
                    multiline={field.type === 'textarea' || field.type === 'json'}
                    onChange={(event) => {
                      setFormValues((current) => ({
                        ...current,
                        [field.key]: normalizeFormValue(event.target.value, field),
                      }));
                    }}
                    required={field.required}
                    rows={field.type === 'textarea' ? 3 : field.type === 'json' ? 5 : undefined}
                    select={field.type === 'select'}
                    type={field.type && field.type !== 'select' && field.type !== 'textarea' && field.type !== 'json' ? field.type : 'text'}
                    value={getInputValue(getNestedValue(formValues, field.key), field)}
                    slotProps={field.readOnly ? { input: { readOnly: true } } : undefined}
                  >
                    {(field.options ?? fieldOptions[field.key])?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )
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
