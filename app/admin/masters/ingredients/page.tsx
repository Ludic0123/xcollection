import { createClient } from '@/lib/supabase/server'
import MasterTable from '@/components/admin/MasterTable'

export const dynamic = 'force-dynamic'

export default async function IngredientsAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('master_ingredients')
    .select('*')
    .order('genre')
    .order('display_order')
    .order('name')
  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">MASTERS</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Ingredients.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        写真に紐づける食材の選択肢。ジャンル別に管理（ジャンル名はお店のジャンルと一致させてください）。
      </p>
      <MasterTable
        tableName="master_ingredients"
        fields={[
          { key: 'genre', label: 'ジャンル', required: true, placeholder: '寿司' },
          { key: 'name', label: '食材名', required: true, placeholder: '赤身' },
          { key: 'display_order', label: '並び順', type: 'number' },
        ]}
        rows={data ?? []}
        groupBy="genre"
        defaultNewRow={{ display_order: 100 }}
      />
    </div>
  )
}
