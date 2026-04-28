import { GenericTable } from '../organisms/GenericTable'
import {
  CONFIG_TABLE_COLUMNS,
  CONFIG_TABLE_PERMISSION,
  CONFIG_TABLE_ROWS,
  type ConfigTableRow,
} from '../../features/configurator/mockData'

/**
 * Tela de configurador com exemplo de tabela generica.
 * Demonstra como conectar dados, permissoes e callbacks de acao.
 */
export function ConfiguratorPage() {
  /** Handler de inclusao de registro. */
  const handleCreate = () => {
    console.info('Acao: incluir novo registro.')
  }

  /** Handler de edicao de registro. */
  const handleEdit = (row: ConfigTableRow) => {
    console.info(`Acao: editar registro ${row.id}.`)
  }

  /** Handler de exclusao de registro. */
  const handleDelete = (row: ConfigTableRow) => {
    console.info(`Acao: excluir registro ${row.id}.`)
  }

  return (
    <GenericTable
      columns={CONFIG_TABLE_COLUMNS}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onEdit={handleEdit}
      permissions={CONFIG_TABLE_PERMISSION}
      rows={CONFIG_TABLE_ROWS}
      title="Tabelas Banco de Dados"
    />
  )
}
