import { createClient } from '@/lib/supabase/server'
import MasterTable from '@/components/admin/MasterTable'

export default async function HotelBrandsAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('master_hotel_brands')
    .select('*')
    .order('display_order')
    .order('name')
  return (
    <div className="px-10 py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">MASTERS</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Hotel brands.</h1>
      <p className="text-sm text-neutral-500 mb-6">ホテルブランドの選択肢。</p>
      <MasterTable
        tableName="master_hotel_brands"
        fields={[
          { key: 'name', label: '名前', required: true, placeholder: '例: アマン' },
          { key: 'display_order', label: '並び順', type: 'number' },
        ]}
        rows={data ?? []}
        defaultNewRow={{ display_order: 100 }}
      />
    </div>
  )
}
