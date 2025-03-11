"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { useRef } from "react";

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

interface ColorPickerProps {
  color: HexColor;
  onChange: (color: HexColor) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const squareRef = useRef<HTMLDivElement>(null);
  const hsla = useMemo(() => hexToHSLA(color), [color]);
  const [hue, setHue] = useState(hsla.h);
  const [saturation, setSaturation] = useState(hsla.s);
  const [lightness, setLightness] = useState(hsla.l);
  const [alpha, setAlpha] = useState(hsla.a);
  const [position, setPosition] = useState({
    x: hsla.s,
    y: Math.min(100, Math.max(0, 100 - hsla.l * 2)),
  });

  const onMove = useCallback(
    (clientX: number, clientY: number, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      setPosition({ x: x * 100, y: y * 100 });
      setSaturation(y === 0 ? 100 : x * 100);
      setLightness((100 - (x * 50)) * (1 - y));
    },
    [],
  );

  const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

    setPosition({ x: x * 100, y: y * 100 });
    setSaturation(x * 100);
    setLightness((100 - (x * 50)) * (1 - y));
  }, []);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMove(event.clientX, event.clientY, event.currentTarget);
    },
    [onMove],
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      const touch = event.touches[0];
      onMove(touch.clientX, touch.clientY, event.currentTarget);
    },
    [onMove],
  );

  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      const square = event.currentTarget;

      const handleMouseMove = (e: MouseEvent) => {
        onMove(e.clientX, e.clientY, square);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onMove],
  );

  const onTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const square = event.currentTarget;

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY, square);
      };

      const handleTouchEnd = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    },
    [onMove],
  );

  useEffect(() => {
    onChange(hslaToHex({ h: hue, s: saturation, l: lightness, a: alpha }));
  }, [hue, saturation, lightness, alpha, onChange]);

  return (
    <div className="flex flex-col gap-4 w-64">
      <div
        ref={squareRef}
        className="relative w-full h-64 rounded-lg cursor-crosshair touch-none border border-gray-200"
        style={{
          backgroundColor: `hsl(${hue}, 100%, 50%)`,
          backgroundImage:
            "linear-gradient(to top, rgb(0, 0, 0), transparent), linear-gradient(to right, rgb(255, 255, 255), transparent)",
        }}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseMove={(e) => e.buttons === 1 && onMouseMove(e)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {/* Selection circle */}
        <div
          className="absolute w-4 h-4 border border-gray-200 bg-white rounded-full shadow-sm transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <ColorSlider
          value={[hue]}
          max={360}
          step={1}
          className="h-4 rounded-md"
          onValueChange={(values) => setHue(values[0])}
        />

        <AlphaSlider
          value={[alpha]}
          min={0}
          max={1}
          step={0.01}
          hsla={{ h: hue, s: saturation, l: lightness, a: alpha }}
          className="h-4 rounded-md"
          onValueChange={(values) => setAlpha(values[0])}
        />
      </div>
    </div>
  );
}

function ColorSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 360,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
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
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="bg-white border border-gray-300 block size-4 shrink-0 rounded-full transition-[color,box-shadow] focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
}

function AlphaSlider({
  className,
  defaultValue,
  value,
  hsla,
  min = 0,
  max = 1,
  ...props
}: {
  hsla: HSLA;
} & React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <TransparentPattern />
      </div>
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full",
        )}
        style={{
          background: `linear-gradient(to right, 
            hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, 0),
            hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, 1)
          )`,
        }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="bg-white border border-gray-300 block size-4 shrink-0 rounded-full transition-[color,box-shadow] focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
}

function TransparentPattern() {
  return (
    <svg width="100%" height="100%">
      <title>Transparent Pattern</title>
      <defs>
        <pattern
          id="color-picker-transparent-pattern"
          width="0.666rem"
          height="0.666rem"
          patternUnits="userSpaceOnUse"
        >
          <rect width="0.666rem" height="0.666rem" fill="#fff" />
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

export function hslaToRGBA({ h, s, l, a = 1 }: HSLA): RGBA {
  // Convert HSLA percentages to decimals
  const saturation = s / 100;
  const lightness = l / 100;

  // Calculate chroma
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  // Convert to RGB values between 0-255
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  };
}

export function rgbaToHex(
  { r, g, b, a = 1 }: RGBA,
  { alpha = true }: { alpha?: boolean } = {},
): HexColor {
  const toHex = (c: number) => Math.round(c).toString(16).padStart(2, "0");

  const alphaHex = alpha ? a <= 1 ? toHex(Math.round(a * 255)) : "" : "";

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`;
}

export function hslaToHex({ h, s, l, a = 1 }: HSLA): HexColor {
  return rgbaToHex(hslaToRGBA({ h, s, l, a }));
}

export function hexToHSLA(hex: HexColor): HSLA {
  // First convert hex to RGBA
  const rgba = hexToRGBA(hex);

  // Get RGB values in 0-1 range
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Calculate HSL values
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (delta !== 0) {
    // Calculate hue
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }

    // Make sure hue is positive
    if (h < 0) {
      h += 360;
    }

    // Calculate saturation
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgba.a,
  };
}

export function hexToRGBA(hex: HexColor): RGBA {
  // Remove the # if present
  const hexValue = hex.replace(/^#/, "");

  // Parse based on length
  let r: number;
  let g: number;
  let b: number;
  let a = 1;

  if (hexValue.length === 3) {
    // #RGB format
    r = Number.parseInt(hexValue[0] + hexValue[0], 16);
    g = Number.parseInt(hexValue[1] + hexValue[1], 16);
    b = Number.parseInt(hexValue[2] + hexValue[2], 16);
  } else if (hexValue.length === 6) {
    // #RRGGBB format
    r = Number.parseInt(hexValue.slice(0, 2), 16);
    g = Number.parseInt(hexValue.slice(2, 4), 16);
    b = Number.parseInt(hexValue.slice(4, 6), 16);
  } else if (hexValue.length === 8) {
    // #RRGGBBAA format
    r = Number.parseInt(hexValue.slice(0, 2), 16);
    g = Number.parseInt(hexValue.slice(2, 4), 16);
    b = Number.parseInt(hexValue.slice(4, 6), 16);
    a = Number.parseInt(hexValue.slice(6, 8), 16) / 255;
  } else if (hexValue.length === 4) {
    // #RGBA format
    r = Number.parseInt(hexValue[0] + hexValue[0], 16);
    g = Number.parseInt(hexValue[1] + hexValue[1], 16);
    b = Number.parseInt(hexValue[2] + hexValue[2], 16);
    a = Number.parseInt(hexValue[3] + hexValue[3], 16) / 255;
  } else {
    throw new Error("Invalid hex color format");
  }

  return { r, g, b, a };
}
