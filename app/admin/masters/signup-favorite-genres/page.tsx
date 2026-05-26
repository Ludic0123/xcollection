import { createClient } from '@/lib/supabase/server'
import MasterTable from '@/components/admin/MasterTable'

export const dynamic = 'force-dynamic'

export default async function SignupFavoriteGenresAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('master_signup_favorite_genres')
    .select('*')
    .order('display_order')
    .order('name')
  return (
    <div className="px-4 py-6 md:px-10 md:py-10">
      <p className="text-[10px] tracking-luxe text-neutral-400">MASTERS</p>
      <h1 className="font-serif text-4xl italic font-light mt-1 mb-6">Favorite genres.</h1>
      <p className="text-sm text-neutral-500 mb-6">
        会員登録時の「好きなジャンル」の選択肢。
      </p>
      <MasterTable
        tableName="master_signup_favorite_genres"
        fields={[
          { key: 'name', label: '名前', required: true, placeholder: '寿司' },
          { key: 'display_order', label: '並び順', type: 'number' },
        ]}
        rows={data ?? []}
        defaultNewRow={{ display_order: 100 }}
      />
    </div>
  )
}
