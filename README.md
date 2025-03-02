# Shadcn Color Picker

## Preview
https://shadcn-color-picker-sigma.vercel.app/

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Usage

```tsx
// app/page.tsx
import { useMemo, useState } from "react";
import {
  ColorPicker,
  type HexColor,
  hexToHSLA,
} from "@/components/ui/color-picker";

export default function Home() {
  const [color, setColor] = useState<HexColor>("#00ffff");
  const hsla = useMemo(() => hexToHSLA(color), [color]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <ColorPicker color={color} onChange={setColor} />
      <div className="mt-4 flex items-center justify-center gap-3">
        <span
          className="size-4 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-gray-600 tracking-wide font-mono font-medium uppercase">
          {color}
        </span>
        <span className="text-gray-600 tracking-wide font-mono font-medium uppercase">
          {Math.round(hsla.a * 100)}%
        </span>
      </div>
    </main>
  );
}
```

## Customization
Just copy the code from `components/ui/color-picker.tsx` and change the styles to your liking.

## Screenshot
![WX20250303-012107@2x](https://github.com/user-attachments/assets/9d3de286-fddf-4005-915c-f86081e1d99b)

## License

MIT

