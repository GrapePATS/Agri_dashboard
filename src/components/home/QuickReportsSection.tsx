import { useNavigate } from 'react-router-dom';

interface ReportCard {
  emoji: string;
  title: string;
  summary: string;
  iconBg: string;
  path: string;
}

const REPORT_CARDS: ReportCard[] = [
  {
    emoji: '📋',
    title: 'รายงานประจำวัน',
    summary: 'สรุปผลการสแกนวันนี้',
    iconBg: 'bg-blue-50',
    path: '/reports?period=daily',
  },
  {
    emoji: '📊',
    title: 'รายงานสัปดาห์นี้',
    summary: 'ภาพรวม 7 วันที่ผ่านมา',
    iconBg: 'bg-purple-50',
    path: '/reports?period=weekly',
  },
  {
    emoji: '🌾',
    title: 'วิเคราะห์ผลผลิต',
    summary: 'คาดการณ์และคุณภาพข้าว',
    iconBg: 'bg-green-50',
    path: '/reports?period=monthly',
  },
  {
    emoji: '🔬',
    title: 'แนวโน้มโรค',
    summary: 'ติดตามการระบาด',
    iconBg: 'bg-red-50',
    path: '/reports',
  },
];

export function QuickReportsSection() {
  const navigate = useNavigate();

  return (
    <div className="px-4">
      <div className="grid grid-cols-2 gap-2.5">
        {REPORT_CARDS.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 text-left active:bg-stone-50 flex flex-col"
          >
            <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center text-2xl mb-3`}>
              {card.emoji}
            </div>
            <p className="text-sm font-bold text-stone-900 leading-tight mb-1">{card.title}</p>
            <p className="text-xs text-stone-400 leading-snug flex-1">{card.summary}</p>
            <div className="flex gap-2 mt-3">
              <div className="flex-1 bg-green-700 rounded-lg py-2 text-center text-xs font-semibold text-white">
                เปิด
              </div>
              <div className="flex-1 bg-stone-100 rounded-lg py-2 text-center text-xs font-semibold text-stone-600">
                แชร์
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Areas to inspect */}
      <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">📍</span>
          <p className="text-sm font-bold text-amber-800">พื้นที่ที่ควรตรวจสอบ</p>
        </div>
        <div className="space-y-2">
          {[
            { zone: 'แปลง C', reason: 'โรคไหม้ข้าว + เพลี้ยกระโดด', urgent: true },
            { zone: 'แปลง B', reason: 'ขอบใบไหม้แบคทีเรีย', urgent: false },
          ].map((item) => (
            <div key={item.zone} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.urgent ? 'bg-red-500' : 'bg-amber-500'}`} />
                <p className="text-xs font-semibold text-stone-800">{item.zone}</p>
                <p className="text-xs text-stone-500">— {item.reason}</p>
              </div>
              {item.urgent && (
                <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                  ด่วน
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
