"use client";

// A guide's gear checklist: tick off each item you have (saved in this browser), with how much it
// matters and why. Each row's label is the item's name, so clicking the name ticks the box too.
import type { ReactNode } from "react";
import TableCard from "@/frontend/components/ui/TableCard";
import NeedTag from "./NeedTag";
import { useGearChecks } from "./useGearChecks";

export type GearRow = {
  item: string;
  need: string; // "Required", "Recommended"…
  required: boolean;
  why: ReactNode;
};

type GearTableProps = {
  id: string; // the guide's key, e.g. "bee": rows are saved as "bee-0", "bee-1"…
  rows: GearRow[];
};

export default function GearTable({ id, rows }: GearTableProps) {
  const { isChecked, set } = useGearChecks();
  return (
    <TableCard>
      {/* "gear" is a test hook. */}
      <table className="gear">
        <thead>
          <tr>
            <th scope="col" className="w-12">
              <span className="print:hidden">Got it</span>
            </th>
            <th>Item</th>
            <th>Need</th>
            <th>Why and specs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const key = `${id}-${i}`;
            return (
              <tr key={key}>
                <td className="w-12">
                  <input
                    type="checkbox"
                    id={key}
                    className="size-5 cursor-pointer accent-green"
                    aria-label={`Have ${r.item}`}
                    checked={isChecked(key)}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                </td>
                <td>
                  <label htmlFor={key} className="cursor-pointer">
                    <b>{r.item}</b>
                  </label>
                </td>
                <td>
                  <NeedTag required={r.required}>{r.need}</NeedTag>
                </td>
                <td>{r.why}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableCard>
  );
}
