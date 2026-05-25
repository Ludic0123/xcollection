import { createClient } from '@/lib/supabase/server'
import MasterTable from '@/components/admin/MasterTable'
import { CATEGORY_LABELS } from '@/types'

export default async function GenresAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('master_genres')
    .select('*')
    .order('category')
    .order('display_order')
  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">MASTERS</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Genres.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        お店のジャンル選択肢。カテゴリ別に管理。
      </p>
      <MasterTable
        tableName="master_genres"
        fields={[
          { key: 'category', label: 'カテゴリ', required: true, placeholder: 'restaurant / hotel / cafe / bar / other' },
          { key: 'name', label: '名前', required: true },
          { key: 'display_order', label: '並び順', type: 'number' },
        ]}
        rows={data ?? []}
        groupBy="category"
        groupLabels={CATEGORY_LABELS}
        defaultNewRow={{ display_order: 100 }}
      />
    </div>
  )
}
