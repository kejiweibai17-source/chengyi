"use client";

import { useState } from "react";
import type { OrderItem, UploadVersion } from "@/data/member";

type Props = {
  item: OrderItem;
  canUpload: boolean;
};

export function UploadPanel({ item, canUpload }: Props) {
  const [versions, setVersions] = useState<UploadVersion[]>(item.uploads);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fileName.trim()) {
      setMessage("請選擇或輸入檔名（Demo 示意）");
      return;
    }
    if (versions.length >= 5) {
      setMessage("每品項最多保留 5 個歷史版本，請先清除較舊非核准版。");
      return;
    }

    const next: UploadVersion = {
      version: versions.length + 1,
      fileName: fileName.trim(),
      uploadedAt: new Date()
        .toLocaleString("zh-TW", { hour12: false })
        .replace(/\//g, "-"),
      note: item.status === "待補件" ? "補件重傳（Demo）" : "上傳成功僅代表已收到",
    };

    setVersions((prev) => [...prev, next]);
    setFileName("");
    setMessage("已模擬上傳。實際上線後會寫入 Storage，狀態改為「待檢稿」。");
  };

  return (
    <div className="border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-[family-name:var(--font-display-tc)] text-lg">
          檔案上傳／版本
        </h3>
        <p className="mt-1 text-sm text-mute">
          支援 PDF、AI、ZIP；單檔預設 100MB。每品項最多 5 個歷史版本。
        </p>
      </div>

      {item.rejectReason ? (
        <div className="border-b border-brand/20 bg-brand/5 px-5 py-3 text-sm text-brand-deep">
          退件原因：{item.rejectReason}
        </div>
      ) : null}

      <ul className="divide-y divide-line">
        {versions.length === 0 ? (
          <li className="px-5 py-6 text-sm text-mute">尚未上傳檔案</li>
        ) : (
          versions.map((file) => (
            <li
              key={`${file.version}-${file.fileName}`}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  v{file.version} · {file.fileName}
                </p>
                <p className="text-xs text-mute">
                  {file.uploadedAt}
                  {file.note ? `｜${file.note}` : ""}
                </p>
              </div>
              {file.approved ? (
                <span className="text-xs tracking-wide text-ink">已核准</span>
              ) : null}
            </li>
          ))
        )}
      </ul>

      {canUpload ? (
        <form onSubmit={onSubmit} className="border-t border-line px-5 py-4">
          <label className="block text-sm text-ink-soft">
            選擇檔案（Demo：填檔名即可）
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="例如：final-artwork.pdf"
              className="mt-2 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink"
            />
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="h-10 bg-ink px-5 text-sm text-paper transition-colors hover:bg-ink-soft"
            >
              上傳檔案
            </button>
            <p className="text-xs text-mute">上傳成功僅代表已收到，需待人工檢稿。</p>
          </div>
          {message ? <p className="mt-3 text-sm text-ink-soft">{message}</p> : null}
        </form>
      ) : (
        <div className="border-t border-line px-5 py-4 text-sm text-mute">
          目前狀態不可上傳。若核准後需換檔，新上傳會回到「待檢稿」。
        </div>
      )}
    </div>
  );
}
