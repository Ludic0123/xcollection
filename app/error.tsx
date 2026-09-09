'use client'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="px-8 py-12 space-y-4">
    <p className="text-sm text-red-600">データを読み込めませんでした。通信状態を確認して、再読み込みしてください。</p>
    <button onClick={reset} className="bg-black text-white px-6 py-3 text-xs">再読み込み</button>
  </div>
}
