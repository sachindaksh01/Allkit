import React from "react";
import { X } from "lucide-react";

export interface ToolCategory {
  title: string;
  items: { title: string; href: string; description: string }[];
}

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
  categories: ToolCategory[];
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ open, onClose, categories }) => {
  if (!open) return null;
  // Flatten all items into a single array for column layout
  const allItems: ToolCategory['items'][number][] = categories.flatMap(cat => cat.items);
  const columns: ToolCategory['items'][number][][] = [[], [], []];
  allItems.forEach((item, idx) => {
    columns[idx % 3].push(item);
  });
  return (
    <div className="fixed bottom-0 left-0 w-full h-1/2 z-[999] bg-[#10131a] flex flex-col">
      <button
        className="absolute top-6 right-8 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 transition z-10"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X size={28} />
      </button>
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {columns.map((col, colIdx) => (
            <ul key={colIdx} className="space-y-2">
              {col.map((item, idx) => (
                <li key={item.title + idx}>
                  <a
                    href={item.href}
                    className="block px-3 py-2 rounded-md hover:bg-blue-900/30 text-white transition font-medium"
                  >
                    <span className="block text-base font-semibold">{item.title}</span>
                    <span className="block text-xs text-gray-300">{item.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}; 