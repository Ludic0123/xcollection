import { createClient } from '@/lib/supabase/server'
import MasterTable from '@/components/admin/MasterTable'

export default async function PriceRangesAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('master_price_ranges')
    .select('*')
    .order('level')
  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">MASTERS</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Price ranges.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        価格帯のラベル。レベルは 1〜5 固定で、表示ラベルだけ編集可能です。
      </p>
      <MasterTable
        tableName="master_price_ranges"
        pkField="level"
        fields={[
          { key: 'level', label: 'レベル', type: 'number' },
          { key: 'label', label: '表示ラベル', required: true },
        ]}
        rows={data ?? []}
        allowCreate={false}
        allowDelete={false}
      />
    </div>
  )
}
