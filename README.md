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
```

## Screenshot
![color-picker](https://github.com/user-attachments/assets/25cf79ae-94e1-4fe3-ad67-4750fdc5a039)

## License

MIT

