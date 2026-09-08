import {
  createContext,
  createElement,
  useContext,
  type ReactNode,
} from 'react'
import { DEFAULT_AGENDA_LABELS_ES, type AgendaLabels } from './labels.js'
import type { AgendaDataSource } from '../adapters/types.js'

const LabelsContext = createContext<AgendaLabels>(DEFAULT_AGENDA_LABELS_ES)
const DataSourceContext = createContext<AgendaDataSource | null>(null)

export function AgendaLabelsProvider({
  labels,
  children,
}: {
  labels?: Partial<AgendaLabels>
  children: ReactNode
}) {
  const value = { ...DEFAULT_AGENDA_LABELS_ES, ...labels }
  return createElement(LabelsContext.Provider, { value }, children)
}

export function useAgendaLabels(): AgendaLabels {
  return useContext(LabelsContext)
}

export function AgendaDataSourceProvider({
  dataSource,
  children,
}: {
  dataSource: AgendaDataSource
  children: ReactNode
}) {
  return createElement(DataSourceContext.Provider, { value: dataSource }, children)
}

export function useAgendaDataSource(): AgendaDataSource {
  const ds = useContext(DataSourceContext)
  if (!ds) {
    throw new Error('useAgendaDataSource requires AgendaDataSourceProvider')
  }
  return ds
}

export function useOptionalAgendaDataSource(): AgendaDataSource | null {
  return useContext(DataSourceContext)
}
