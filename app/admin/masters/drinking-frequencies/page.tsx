import { createClient } from '@/lib/supabase/server'
import MasterTable from '@/components/admin/MasterTable'

export const dynamic = 'force-dynamic'

export default async function DrinkingFrequenciesAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('master_drinking_frequencies')
    .select('*')
    .order('display_order')
    .order('name')
  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">MASTERS</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Drinking frequency.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        会員登録時の「酒を飲む頻度」の選択肢。
      </p>
      <MasterTable
        tableName="master_drinking_frequencies"
        fields={[
          { key: 'name', label: '名前', required: true, placeholder: '毎日' },
          { key: 'display_order', label: '並び順', type: 'number' },
        ]}
        rows={data ?? []}
        defaultNewRow={{ display_order: 100 }}
      />
    </div>
  )
}
