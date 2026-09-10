import { createClient } from '@/lib/supabase/server'
import MasterTable from '@/components/admin/MasterTable'

export default async function ReservationMethodsAdminPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('master_reservation_methods')
    .select('*')
    .order('display_order')
  if (error) throw new Error('マスターを取得できませんでした: ' + error.message)
  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-xs tracking-luxe text-neutral-600">MASTERS</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Reservation methods.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        予約方法の選択肢。
        <span className="text-neutral-600 text-xs ml-2">
          ※ value (内部キー) は半角英数+アンダースコアで一意に
        </span>
      </p>
      <MasterTable
        tableName="master_reservation_methods"
        fields={[
          { key: 'value', label: 'VALUE (内部ID)', required: true, placeholder: 'phone' },
          { key: 'label', label: '表示名', required: true, placeholder: '電話' },
          { key: 'display_order', label: '並び順', type: 'number' },
        ]}
        rows={data ?? []}
        defaultNewRow={{ display_order: 100 }}
      />
    </div>
  )
}
