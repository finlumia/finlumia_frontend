import { Button } from '../atoms/Button'
import type { CrudPermission } from '../../shared/types/access'
import './GenericTable.css'

/**
 * Define a estrutura de uma coluna da tabela.
 *
 * @template T - Tipo do objeto que representa cada linha da tabela.
 *
 * @property key   - Chave do objeto `T` cujo valor será exibido na célula.
 *                   Utiliza `keyof T` para garantia de tipo em tempo de compilação.
 * @property label - Texto exibido no cabeçalho (`<th>`) da coluna.
 *
 * @example
 * const columns: TableColumn<Produto>[] = [
 *   { key: 'nome',  label: 'Nome do produto' },
 *   { key: 'preco', label: 'Preço (R$)'      },
 * ]
 */
type TableColumn<T> = {
  key: keyof T
  label: string
}

/**
 * Props aceitas pelo componente {@link GenericTable}.
 *
 * @template T - Tipo das linhas da tabela. Deve obrigatoriamente conter
 *               a propriedade `id` do tipo `string | number`, usada como
 *               `key` do React nas iterações.
 *
 * @property title       - Título exibido no cabeçalho da seção.
 * @property columns     - Definição das colunas a serem renderizadas.
 *                         Declarado como `readonly` para evitar mutação acidental.
 * @property rows        - Array de objetos que alimentam as linhas da tabela.
 * @property permissions - Objeto {@link CrudPermission} que controla quais
 *                         ações (criar, editar, excluir) são visíveis.
 * @property onCreate    - Callback disparado ao clicar em "Incluir novo".
 *                         Omitido quando `permissions.canCreate` é `false`.
 * @property onEdit      - Callback disparado ao clicar em "Editar" em uma linha.
 *                         Recebe o objeto completo da linha como argumento.
 *                         Omitido quando `permissions.canEdit` é `false`.
 * @property onDelete    - Callback disparado ao clicar em "Excluir" em uma linha.
 *                         Recebe o objeto completo da linha como argumento.
 *                         Omitido quando `permissions.canDelete` é `false`.
 */
type GenericTableProps<T extends { id: string | number }> = {
  title: string
  columns: readonly TableColumn<T>[]
  rows: T[]
  permissions: CrudPermission
  onCreate?: () => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
}

/**
 * Tabela genérica orientada a configuração.
 *
 * Renderiza dinamicamente colunas e linhas a partir de props tipadas,
 * eliminando a necessidade de criar uma tabela específica para cada entidade.
 * As ações de CRUD são exibidas condicionalmente com base no objeto
 * `permissions`, permitindo controle de acesso declarativo por contexto.
 *
 * ---
 *
 * ### Comportamento de permissões
 *
 * | Flag               | Efeito                                          |
 * | ------------------ | ----------------------------------------------- |
 * | `canCreate: true`  | Renderiza o botão "Incluir novo" no cabeçalho   |
 * | `canEdit: true`    | Renderiza o botão "Editar" em cada linha        |
 * | `canDelete: true`  | Renderiza o botão "Excluir" em cada linha       |
 *
 * ---
 *
 * ### Renderização de células
 *
 * Os valores das células são convertidos para `string` via `String()`.
 * Para tipos complexos (datas, moedas, booleanos), aplique a formatação
 * **antes** de passar o dado na prop `rows`, ou estenda o tipo `TableColumn`
 * com uma função `render?: (value: T[keyof T]) => ReactNode`.
 *
 * ---
 *
 * ### Exemplo de uso
 *
 * ```tsx
 * type Fornecedor = {
 *   id: number
 *   razaoSocial: string
 *   cnpj: string
 *   ativo: boolean
 * }
 *
 * const colunas: TableColumn<Fornecedor>[] = [
 *   { key: 'razaoSocial', label: 'Razão social' },
 *   { key: 'cnpj',        label: 'CNPJ'         },
 *   { key: 'ativo',       label: 'Ativo'         },
 * ]
 *
 * const permissoes: CrudPermission = {
 *   canCreate: true,
 *   canEdit:   true,
 *   canDelete: false, // operador sem permissão de exclusão
 * }
 *
 * <GenericTable<Fornecedor>
 *   title="Fornecedores"
 *   columns={colunas}
 *   rows={fornecedores}
 *   permissions={permissoes}
 *   onCreate={() => abrirModal('criar')}
 *   onEdit={(row) => abrirModal('editar', row)}
 * />
 * ```
 *
 * @template T - Tipo das linhas. Deve conter `id: string | number`.
 *
 * @param props - {@link GenericTableProps}
 * @returns Elemento `<section>` contendo cabeçalho e tabela com scroll horizontal.
 */
export function GenericTable<T extends { id: string | number }>({
  title,
  columns,
  rows,
  permissions,
  onCreate,
  onEdit,
  onDelete,
}: GenericTableProps<T>) {
  return (
    <section className="generic-table">
      {/*
       * Cabeçalho da seção.
       * Exibe o título, o total de registros carregados e,
       * condicionalmente, o botão de criação.
       */}
      <header className="generic-table__header">
        <div>
          <h2>{title}</h2>
          {/* Contador auxiliar para feedback imediato ao usuário */}
          <small>Total de registros: {rows.length}</small>
        </div>

        {/*
         * Botão de criação visível apenas quando `canCreate` é verdadeiro.
         * O callback `onCreate` é opcional: se não fornecido, nenhum erro
         * é lançado pois o botão simplesmente não é renderizado.
         */}
        {permissions.canCreate && (
          <Button onClick={onCreate} variant="primary">
            Incluir novo
          </Button>
        )}
      </header>

      {/*
       * Wrapper com overflow-x: auto definido via CSS.
       * Garante scroll horizontal em viewports estreitos sem
       * comprometer o layout externo da página.
       */}
      <div className="generic-table__scroll">
        <table>
          <thead>
            <tr>
              {/*
               * Cabeçalhos gerados dinamicamente a partir de `columns`.
               * `String(column.key)` converte o `keyof T` para string,
               * necessário porque `keyof T` pode ser `string | number | symbol`.
               */}
              {columns.map((column) => (
                <th key={String(column.key)}>{column.label}</th>
              ))}

              {/* Coluna fixa de ações; sempre renderizada à direita */}
              <th>Acoes</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              /*
               * `row.id` é garantido pelo constraint `T extends { id: string | number }`,
               * tornando a key do React estável e sem risco de duplicatas acidentais.
               */
              <tr key={row.id}>
                {columns.map((column) => (
                  /*
                   * Key composta `{id}-{key}` evita colisões quando múltiplas
                   * colunas compartilham valores idênticos na mesma linha.
                   * `String()` normaliza qualquer tipo primitivo para exibição segura.
                   */
                  <td key={`${row.id}-${String(column.key)}`}>
                    {String(row[column.key])}
                  </td>
                ))}

                {/*
                 * Célula de ações: renderiza os botões de edição e exclusão
                 * condicionalmente, com base nas flags de permissão.
                 * O optional chaining (`onEdit?.(row)`) protege contra a ausência
                 * do callback mesmo que a flag de permissão esteja ativa.
                 */}
                <td className="generic-table__actions">
                  {permissions.canEdit && (
                    <Button onClick={() => onEdit?.(row)} variant="ghost">
                      Editar
                    </Button>
                  )}
                  {permissions.canDelete && (
                    <Button onClick={() => onDelete?.(row)} variant="danger">
                      Excluir
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}