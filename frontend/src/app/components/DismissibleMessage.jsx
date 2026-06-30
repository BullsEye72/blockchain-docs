"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const styles = {
  success: "bg-green-50 border-green-300 text-green-800",
  error: "bg-red-50 border-red-300 text-red-800",
};

export default function DismissibleMessage({ type, message, title }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(type === "success" || type === "error");
  }, [type, message, title]);

  if (!visible) return null;

  return (
    <div className={`flex items-start gap-3 border rounded-lg p-3 text-sm ${styles[type] ?? styles.error}`}>
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {message && <p className="mt-0.5">{message}</p>}
      </div>
      <button onClick={() => setVisible(false)} className="shrink-0 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
