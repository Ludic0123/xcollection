'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Save } from 'lucide-react'

export type FieldDef = {
  key: string
  label: string
  type?: 'text' | 'number'
  placeholder?: string
  required?: boolean
}

type Row = Record<string, unknown> & { id?: string | number }

export default function MasterTable({
  tableName,
  pkField = 'id',
  fields,
  rows,
  groupBy,
  groupLabels,
  defaultNewRow,
  allowCreate = true,
  allowDelete = true,
}: {
  tableName: string
  pkField?: string
  fields: FieldDef[]
  rows: Row[]
  groupBy?: string
  groupLabels?: Record<string, string>
  defaultNewRow?: Partial<Row>
  allowCreate?: boolean
  allowDelete?: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<Record<string, Row>>({})
  const [newRow, setNewRow] = useState<Row>(defaultNewRow ?? {})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const grouped: Record<string, Row[]> = {}
  if (groupBy) {
    for (const r of rows) {
      const k = String(r[groupBy] ?? '')
      ;(grouped[k] ||= []).push(r)
    }
  }

  function startEdit(row: Row) {
    const k = String(row[pkField])
    setEditing({ ...editing, [k]: { ...row } })
  }
  function cancelEdit(row: Row) {
    const k = String(row[pkField])
    const e = { ...editing }
    delete e[k]
    setEditing(e)
  }
  function changeField(row: Row, key: string, value: unknown) {
    const k = String(row[pkField])
    setEditing({ ...editing, [k]: { ...editing[k], [key]: value } })
  }

  async function save(row: Row) {
    const k = String(row[pkField])
    const updated = editing[k]
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const payload: Row = {}
    for (const f of fields) payload[f.key] = updated[f.key]
    const { error } = await supabase
      .from(tableName)
      .update(payload)
      .eq(pkField, row[pkField])
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    cancelEdit(row)
    router.refresh()
  }

  async function remove(row: Row) {
    if (!confirm('削除しますか？')) return
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.from(tableName).delete().eq(pkField, row[pkField])
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    router.refresh()
  }

  async function create() {
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const payload: Row = { ...newRow }
    for (const f of fields) {
      if (f.required && !payload[f.key]) {
        setError(`${f.label}は必須です`)
        setBusy(false)
        return
      }
    }
    const { error } = await supabase.from(tableName).insert(payload)
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    setNewRow(defaultNewRow ?? {})
    router.refresh()
  }

  function renderRow(row: Row) {
    const k = String(row[pkField])
    const isEditing = !!editing[k]
    const cur = isEditing ? editing[k] : row
    return (
      <tr key={k} className="border-b hairline">
        {fields.map((f) => (
          <td key={f.key} className="py-3 px-3">
            {isEditing ? (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={(cur[f.key] as string | number | undefined) ?? ''}
                onChange={(e) =>
                  changeField(
                    row,
                    f.key,
                    f.type === 'number' ? Number(e.target.value) : e.target.value
                  )
                }
                className="border hairline px-2 py-1 text-sm w-full"
              />
            ) : (
              <span className="text-sm">
                {String(row[f.key] ?? '')}
              </span>
            )}
          </td>
        ))}
        <td className="py-3 px-3 text-right whitespace-nowrap">
          {isEditing ? (
            <>
              <button
                onClick={() => save(row)}
                disabled={busy}
                className="text-[10px] tracking-luxe text-black hover:underline mr-3"
              >
                <Save className="w-3.5 h-3.5 inline" /> SAVE
              </button>
              <button
                onClick={() => cancelEdit(row)}
                className="text-[10px] tracking-luxe text-neutral-400 hover:text-black"
              >
                CANCEL
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(row)}
                className="text-[10px] tracking-luxe text-neutral-500 hover:text-black mr-3"
              >
                EDIT
              </button>
              {allowDelete && (
                <button
                  onClick={() => remove(row)}
                  className="text-neutral-300 hover:text-red-600"
                  aria-label="削除"
                >
                  <Trash2 className="w-3.5 h-3.5 inline" />
                </button>
              )}
            </>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <div className="bg-white border hairline overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b hairline bg-neutral-50">
              {fields.map((f) => (
                <th
                  key={f.key}
                  className="py-2 px-3 text-left text-[10px] tracking-luxe text-neutral-500"
                >
                  {f.label}
                </th>
              ))}
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {groupBy ? (
              Object.keys(grouped)
                .sort()
                .map((g) => (
                  <Fragment key={`g-${g}`}>
                    <tr className="bg-neutral-100">
                      <td
                        colSpan={fields.length + 1}
                        className="py-2 px-3 text-[10px] tracking-luxe text-neutral-500"
                      >
                        {(groupLabels && groupLabels[g]) || g}
                      </td>
                    </tr>
                    {grouped[g].map(renderRow)}
                  </Fragment>
                ))
            ) : (
              rows.map(renderRow)
            )}
            {allowCreate && (
              <tr className="bg-neutral-50">
                {fields.map((f) => (
                  <td key={f.key} className="py-3 px-3">
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      placeholder={f.placeholder ?? f.label}
                      value={(newRow[f.key] as string | number | undefined) ?? ''}
                      onChange={(e) =>
                        setNewRow({
                          ...newRow,
                          [f.key]:
                            f.type === 'number' ? Number(e.target.value) : e.target.value,
                        })
                      }
                      className="border hairline px-2 py-1 text-sm w-full"
                    />
                  </td>
                ))}
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={create}
                    disabled={busy}
                    className="text-[10px] tracking-luxe bg-black text-white px-3 py-1.5 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3 inline" /> ADD
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
