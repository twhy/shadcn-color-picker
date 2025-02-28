"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";
import { useMemo, useRef } from "react";

export type HSLA = {
  h: number;
  s: number;
  l: number;
  a: number;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type HexColor = `#${string}`;

function ColorPicker({
  color = "#ff0000",
  className,
  onChange = () => {},
}: {
  color?: HexColor;
  className?: string;
  onChange?: (color: HexColor) => void;
}) {
  const rgba = useMemo(() => hexToRGBA(color!), [color]);
  return (
    <div className={cn("rounded-lg size-64 relative shadow-sm space-y-4", className)}>
      <SaturationLightness color={color} onChange={onChange} />
      <ColorSlider color={color} onChange={onChange} />
      <AlphaSlider color={color} onChange={onChange} />
      <div className="flex items-center justify-center font-mono font-medium">
        {color} {Math.round(rgba.a * 100)}%
      </div>
    </div>
  );
}

function SaturationLightness({
  className,
  color,
  onChange = () => {},
}: {
  color?: HexColor;
  className?: string;
  onChange?: (color: HexColor) => void;
}) {
  const circle = useRef<HTMLDivElement>(null);
  const square = useRef<HTMLDivElement>(null);
  const rgba = color ? hexToRGBA(color) : { r: 0, g: 0, b: 0, a: 1 };
  const bgc = useMemo(() => {
    return rgbaToHex(hueToRGBA(rgbaToHue(rgba)));
  }, [rgba]);
  
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!circle.current || !square.current) return;
    e.preventDefault();
    e.stopPropagation();

    circle.current.classList.add("-translate-x-1/2", "-translate-y-1/2");

    const rect = square.current.getBoundingClientRect();
    const deltaX = e.clientX - rect.left;
    const deltaY = e.clientY - rect.top;
    const saturation = Math.min(1, Math.max(0, deltaX / rect.width));
    const lightness = Math.min(1, Math.max(0, deltaY / rect.height));
    circle.current.style.left = `${saturation * 100}%`;
    circle.current.style.top = `${lightness * 100}%`;

    const hue = rgbaToHue(hexToRGBA(color!));
    const rgba = hslToRGBA(hue, saturation, lightness);
    onChange?.(rgbaToHex(rgba));
  };

  const onMouseUp = () => {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
  };

  return (
    <div
      ref={square}
      className={cn("rounded-lg size-64 relative shadow-sm", className)}
      style={{
        backgroundColor: bgc,
        backgroundImage:
          "linear-gradient(to top, rgb(0, 0, 0), transparent), linear-gradient(to right, rgb(255, 255, 255), transparent)",
      }}
    >
      <div
        ref={circle}
        className="w-4 h-4 border border-white bg-white shadow-sm rounded-full absolute bottom-1 right-1"
        onMouseDown={onMouseDown}
      />
    </div>
  );
}

function ColorSlider({
  className,
  color,
  defaultColor = "#ff0000",
  disabled = false,
  onChange = () => {},
}: {
  color?: HexColor;
  defaultColor?: HexColor;
  disabled?: boolean;
  className?: string;
  onChange?: (color: HexColor) => void;
}) {
  const hue = useMemo(() => rgbaToHue(hexToRGBA(color!)), [color]);
  const def = useMemo(() => rgbaToHue(hexToRGBA(defaultColor!)), [defaultColor]);
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={[def]}
      value={typeof color === "string" ? [hue] : undefined}
      min={0}
      max={359}
      step={1}
      onValueChange={(values) => onChange?.(rgbaToHex(hueToRGBA(values[0])))}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className,
      )}
      disabled={disabled}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full",
        )}
        style={{
          background:
            "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
        }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-transparent absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="block border size-4 shrink-0 rounded-full bg-white border-white shadow-sm transition-[color,box-shadow] focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
}

function AlphaSlider({
  className,
  color = "#000",
  defaultAlpha = 1,
  disabled = false,
  onChange = () => {},
}: {
  color?: HexColor;
  alpha?: number;
  defaultAlpha?: number;
  disabled?: boolean;
  className?: string;
  onChange?: (color: HexColor) => void;
}) {
  const rgba = hexToRGBA(color!);
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={[defaultAlpha]}
      value={typeof rgba.a === "number" ? [rgba.a] : undefined}
      min={0}
      max={1}
      step={0.01}
      onValueChange={(values) => onChange?.(rgbaToHex({ ...rgba, a: values[0] }))}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className,
      )}
      disabled={disabled}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <TransparentPattern />
      </div>
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full",
        )}
        style={{
          backgroundColor: "transparent",
          backgroundImage:
            `linear-gradient(to right, transparent 0%, ${rgbaToHex({ ...rgba, a: 1 })} 100%)`,
        }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-transparent absolute z-10 data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="block border size-4 shrink-0 rounded-full bg-white border-white shadow-sm transition-[color,box-shadow] focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
}

function TransparentPattern() {
  return (
    <svg width="100%" height="100%">
      <defs>
        <pattern
          id="color-picker-transparent-pattern"
          width="0.666rem"
          height="0.666rem"
          patternUnits="userSpaceOnUse"
        >
          <rect width="0.666rem" height="0.666rem" fill="#fff"></rect>
          <rect x="0" width="0.333rem" height="0.333rem" y="0" fill="#ddd">
          </rect>
          <rect
            x="0.333rem"
            width="0.333rem"
            height="0.333rem"
            y="0.333rem"
            fill="#ddd"
          >
          </rect>
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#color-picker-transparent-pattern)"
      >
      </rect>
    </svg>
  );
}

function hueToRGBA(hue: number): RGBA {
  const s = 1, l = 0.5;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - c / 2;

  const [r, g, b] = hue < 60
    ? [c, x, 0]
    : hue < 120
    ? [x, c, 0]
    : hue < 180
    ? [0, c, x]
    : hue < 240
    ? [0, x, c]
    : hue < 300
    ? [x, 0, c]
    : [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: 1,
  };
}

function hslToRGBA(h: number, s: number, l: number): RGBA {
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) =>
    l - s * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)) * Math.min(l, 1 - l);

  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);

  return { r, g, b, a: 1 };
}

function hexToRGBA(hex: HexColor): RGBA {
  let color = hex.replace(/^#/, "");

  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const hasAlpha = color.length === 8; // Check if hex contains alpha channel
  const bigint = parseInt(color, 16);

  const r = (bigint >> (hasAlpha ? 24 : 16)) & 255;
  const g = (bigint >> (hasAlpha ? 16 : 8)) & 255;
  const b = (bigint >> (hasAlpha ? 8 : 0)) & 255;
  const a = hasAlpha ? Math.round(((bigint & 255) / 255) * 100) / 100 : 1; // Convert alpha to 0-1 range

  return { r, g, b, a };
}

function rgbaToHex({ r, g, b, a = 1 }: RGBA, { alpha = true }: { alpha?: boolean } = {}): HexColor {
  const toHex = (c: number) => Math.round(c).toString(16).padStart(2, "0");

  const alphaHex = alpha ? a <= 1 ? toHex(Math.round(a * 255)) : "" : "";

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`;
}

function rgbaToHue({ r, g, b }: RGBA): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let hue = 0;
  switch (max) {
    case r:
      hue = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / d + 2;
      break;
    case b:
      hue = (r - g) / d + 4;
      break;
  }

  return Math.round(hue * 60);
}

export { AlphaSlider, ColorPicker, ColorSlider, SaturationLightness };
