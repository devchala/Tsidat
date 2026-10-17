import { lazy, Suspense, type ComponentProps } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { PickerMap as PM, PointsMap as PtM } from "./LeafletMaps";
export type { MapPoint } from "./LeafletMaps";

const LPicker = lazy(() => import("./LeafletMaps").then((m) => ({ default: m.PickerMap })));
const LPoints = lazy(() => import("./LeafletMaps").then((m) => ({ default: m.PointsMap })));
const Fallback = () => <div className="h-72 w-full animate-pulse rounded-xl bg-muted" />;

export function PickerMap(props: ComponentProps<typeof PM>) {
  return <ClientOnly fallback={<Fallback />}><Suspense fallback={<Fallback />}><LPicker {...props} /></Suspense></ClientOnly>;
}
export function PointsMap(props: ComponentProps<typeof PtM>) {
  return <ClientOnly fallback={<Fallback />}><Suspense fallback={<Fallback />}><LPoints {...props} /></Suspense></ClientOnly>;
}
