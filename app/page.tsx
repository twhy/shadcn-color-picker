"use client";

import { useMemo, useState } from "react";
import {
  ColorPicker,
  type HexColor,
  hexToHSLA,
  hexToRGBA,
} from "@/components/ui/color-picker";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [color, setColor] = useState<HexColor>("#00ffff");
  const rgba = useMemo(() => hexToRGBA(color), [color]);
  const hsla = useMemo(() => hexToHSLA(color), [color]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-24"
      style={{ backgroundColor: color }}
    >
      <div className="flex flex-col items-center justify-center gap-3 bg-gray-50 p-4 rounded-lg shadow-md">
        <ColorPicker color={color} onChange={setColor} />
        <div className="mt-2 flex items-center justify-center gap-3">
          <span
            className="size-4 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-gray-600 tracking-wide font-mono font-medium uppercase">
            {color}
          </span>
          <span className="text-gray-600 tracking-wide font-mono font-medium uppercase">
            {Math.round(rgba.a * 100)}%
          </span>
        </div>
        <div className="font-mono font-medium flex items-center justify-center">
          RGBA({<ColorValue value={rgba.r} />}, {<ColorValue value={rgba.g} />},
          {" "}
          {<ColorValue value={rgba.b} />},{" "}
          {<ColorValue value={rgba.a.toFixed(2)} />})
        </div>
        <div className="font-mono font-medium flex items-center justify-center">
          HSLA({<ColorValue value={hsla.h} />}, {<ColorValue value={hsla.s} />},
          {" "}
          {<ColorValue value={hsla.l} />},{" "}
          {<ColorValue value={hsla.a.toFixed(2)} />})
        </div>
        <div className="my-1 text-gray-600 text-sm font-mono font-medium hover:underline flex items-center space-x-2">
          <Image src="/github.png" alt="GitHub" width={20} height={20} />
          <Link
            target="_blank"
            href="https://github.com/twhy/shadcn-color-picker"
          >
            twhy/shadcn-color-picker
          </Link>
        </div>
      </div>
    </main>
  );
}

function ColorValue(
  { value, size = 3 }: { value: number | string; size?: number },
) {
  return (
    <pre className="text-gray-600 mx-1 tracking-wide font-mono font-medium uppercase">
      {String(value).padStart(size, " ")}
    </pre>
  );
}
