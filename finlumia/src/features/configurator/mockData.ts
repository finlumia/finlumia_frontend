import type { CrudPermission } from '../../shared/types/access'

export type ConfigTableRow = {
  id: number
  table: string
  description: string
  system: string
  owner: string
}

export const CONFIG_TABLE_COLUMNS = [
  { key: 'table', label: 'Tabela' },
  { key: 'description', label: 'Descricao' },
  { key: 'system', label: 'Sistema' },
  { key: 'owner', label: 'Owner' },
] as const

export const CONFIG_TABLE_ROWS: ConfigTableRow[] = [
  { id: 1, table: 'SYS_TRD', description: 'Campos', system: 'Transaction', owner: 'FIN_SYS' },
  { id: 2, table: 'SYS_FNCT', description: 'Funcoes', system: 'System', owner: 'LEDGER_SRV' },
  { id: 3, table: 'SYS_TPD', description: 'Indices', system: 'Security', owner: 'AUTH_SRV' },
  { id: 4, table: 'FIN_MENU', description: 'Menu', system: 'Audit', owner: 'ARCH_DB' },
]

export const CONFIG_TABLE_PERMISSION: CrudPermission = {
  canCreate: true,
  canEdit: true,
  canDelete: false,
}
