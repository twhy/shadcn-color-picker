"use client";

import { ColorPicker, HexColor } from "@/components/ui/color-picker";
import { useState } from "react";

export default function Home() {
  const [color, setColor] = useState<HexColor>("#00ffff");
  return (
    <div className="flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center justify-center h-screen w-xs space-y-4">
        <ColorPicker color={color} onChange={setColor} />
      </div>
    </div>
  );
}
