import React, { useMemo, useState } from 'react';
import { SyllableSVG } from '../components/game/SyllableSVG';
import { HANGUL_TOTAL, getHangulPage } from '../utils/hangulRange';

const PAGE_SIZE_OPTIONS = [200, 400, 800, 1600] as const;

export const HangulAllGrid: React.FC = () => {
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(400);
  const [page, setPage] = useState(0);
  const [highlight, setHighlight] = useState<0 | 1 | 2>(1); // 0초 1중 2종
  const [query, setQuery] = useState(''); // 특정 음절 점프용 (예: 강)

  const totalPages = Math.ceil(HANGUL_TOTAL / pageSize);

  const items = useMemo(() => getHangulPage(page, pageSize), [page, pageSize]);

  const jumpToQuery = () => {
    if (!query) return;
    const code = query.codePointAt(0);
    if (!code) return;
    const idx = code - 0xac00;
    if (idx < 0 || idx >= HANGUL_TOTAL) return;
    setPage(Math.floor(idx / pageSize));
  };

  const next = () => setPage((p) => Math.min(p + 1, totalPages - 1));
  const prev = () => setPage((p) => Math.max(p - 1, 0));
  const first = () => setPage(0);
  const last = () => setPage(totalPages - 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">가~힣 전체 보기 (총 {HANGUL_TOTAL.toLocaleString()}글자)</h1>

      {/* 컨트롤 바 */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">페이지 크기</label>
          <select
            className="border rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => { setPage(0); setPageSize(Number(e.target.value) as any); }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={first} className="px-2 py-1 border rounded">≪</button>
          <button onClick={prev} className="px-2 py-1 border rounded">〈</button>
          <span className="text-sm text-gray-700">
            {page + 1} / {totalPages}
          </span>
          <button onClick={next} className="px-2 py-1 border rounded">〉</button>
          <button onClick={last} className="px-2 py-1 border rounded">≫</button>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600">하이라이트</label>
          <select
            className="border rounded px-2 py-1"
            value={highlight}
            onChange={(e) => setHighlight(Number(e.target.value) as 0 | 1 | 2)}
          >
            <option value={0}>초성</option>
            <option value={1}>중성</option>
            <option value={2}>종성</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600">음절로 점프</label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.trim().slice(0, 1))}
              placeholder="예: 강"
              className="border rounded px-2 py-1 w-24"
            />
            <button onClick={jumpToQuery} className="px-3 py-1 border rounded bg-white">이동</button>
          </div>
        </div>

        <div className="text-sm text-gray-600 ml-auto">
          범위: {page * pageSize + 1}–{Math.min((page + 1) * pageSize, HANGUL_TOTAL)}
        </div>
      </div>

      {/* 그리드 */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
        }}
      >
        {items.map((syllable) => (
          <div key={syllable} className="bg-white rounded-lg shadow-sm p-2 flex flex-col items-center">
            <SyllableSVG syllable={syllable} highlightIndex={highlight} className="w-20 h-20" />
            <div className="mt-1 text-sm text-gray-700">{syllable}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
