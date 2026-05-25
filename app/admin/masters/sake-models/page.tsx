export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import MasterTable from '@/components/admin/MasterTable'

export default async function SakeModelsAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('master_sake_models')
    .select('*')
    .order('display_order')
    .order('name')
  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">MASTERS</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Sake models.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        日本酒のモデル（純米大吟醸・龍泉 など）。
      </p>
      <MasterTable
        tableName="master_sake_models"
        fields={[
          { key: 'name', label: '名前', required: true, placeholder: '例: 純米大吟醸' },
          { key: 'display_order', label: '並び順', type: 'number' },
        ]}
        rows={data ?? []}
        defaultNewRow={{ display_order: 100 }}
      />
    </div>
  )
}
