'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '1',
    notes: ''
  });
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '送信中...', isError: false });

    try {
      const response = await fetch('/api/supabaseHandler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
          guests: parseInt(formData.guests),
          notes: formData.notes,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unknown error occurred');
      }


      setMessage({ text: '予約が完了しました！', isError: false });
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: '1',
        notes: ''
      });
    } catch (error) {
      const err = error as Error;
      setMessage({ text: `予約に失敗しました: ${err.message}`, isError: true });
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-800 text-white p-4">
        <h1 className="text-2xl font-bold">小さな洋食屋</h1>
      </header>
      <main className="container mx-auto p-4">
        <section className="my-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">本日のメニュー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-800 text-white p-4 rounded shadow">
              <h3 className="font-medium">ハンバーグステーキ</h3>
              <p className="text-amber-100">1,200円</p>
            </div>
            <div className="bg-amber-800 text-white p-4 rounded shadow">
              <h3 className="font-medium">オムライス</h3>
              <p className="text-amber-100">950円</p>
            </div>
            <div className="bg-amber-800 text-white p-4 rounded shadow">
              <h3 className="font-medium">ビーフシチュー</h3>
              <p className="text-amber-100">1,500円</p>
            </div>
            <div className="bg-amber-800 text-white p-4 rounded shadow">
              <h3 className="font-medium">エビフライ</h3>
              <p className="text-amber-100">1,200円</p>
            </div>
            <div className="bg-amber-800 text-white p-4 rounded shadow">
              <h3 className="font-medium">カツカレー</h3>
              <p className="text-amber-100">1,300円</p>
            </div>
            <div className="bg-amber-800 text-white p-4 rounded shadow">
              <h3 className="font-medium">ナポリタン</h3>
              <p className="text-amber-100">1,000円</p>
            </div>
            <div className="bg-amber-800 text-white p-4 rounded shadow">
              <h3 className="font-medium">グラタン</h3>
              <p className="text-amber-100">1,200円</p>
            </div>
            <div className="bg-amber-800 text-white p-4 rounded shadow">
              <h3 className="font-medium">クリームシチュー</h3>
              <p className="text-amber-100">1,400円</p>
            </div>
          </div>
        </section>
      </main>
      <section className="container mx-auto p-4 my-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">予約フォーム</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block font-medium text-gray-800">お名前</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-96 p-2 border border-gray-500 rounded bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-800">メールアドレス</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-96 p-2 border border-gray-500 rounded bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-800">電話番号</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-96 p-2 border border-gray-500 rounded bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-800">予約日</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-96 p-2 border border-gray-500 rounded bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-800">時間</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-96 p-2 border border-gray-500 rounded bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-800">人数</label>
            <select
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              className="w-96 p-2 border border-gray-500 rounded bg-white"
              required
            >
              <option value="1">1名</option>
              <option value="2">2名</option>
              <option value="3">3名</option>
              <option value="4">4名</option>
              <option value="5">5名以上</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block font-medium text-gray-800">備考</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-96 p-2 border border-gray-500 rounded bg-white"
              rows={3}
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-amber-900 text-white px-4 py-2 rounded hover:bg-amber-800 font-bold">
              予約する
            </button>
            {message.text && (
              <p className={`mt-2 ${message.isError ? 'text-red-600' : 'text-green-600'}`}>
                {message.text}
              </p>
            )}
          </div>
        </form>
      </section>
      <footer className="bg-amber-800 text-white p-4 text-center">
        <p>© 2025 小さな洋食屋</p>
      </footer>
    </div>
  );
}
