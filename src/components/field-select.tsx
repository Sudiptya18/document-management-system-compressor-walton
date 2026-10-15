"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SopOption } from "@/lib/sop";
import { cn } from "@/lib/utils";

export function FieldSelect({
  value,
  onChange,
  options,
  placeholder,
  allowEmpty = false,
  emptyLabel = "Any",
}: {
  value: string;
  onChange: (id: string) => void;
  options: SopOption[];
  placeholder: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.id === value);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.symbol.toLowerCase().includes(needle),
    );
  }, [options, query]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-between px-3 font-normal"
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2 text-left">
          {selected ? (
            <>
              <span className="w-12 shrink-0 font-mono text-xs text-primary">
                {selected.symbol}
              </span>
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">
              {allowEmpty && value === "" ? emptyLabel : placeholder}
            </span>
          )}
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--anchor-width)] min-w-72 gap-0 p-0"
      >
        <div className="border-b border-border p-2">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a symbol or name"
            className="h-8 w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {allowEmpty ? (
            <OptionRow
              active={value === ""}
              symbol=""
              label={emptyLabel}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            />
          ) : null}
          {visible.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Nothing matches.
            </p>
          ) : (
            visible.map((option) => (
              <OptionRow
                key={option.id}
                active={option.id === value}
                symbol={option.symbol}
                label={option.label}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function OptionRow({
  active,
  symbol,
  label,
  onClick,
}: {
  active: boolean;
  symbol: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
        active && "bg-muted",
      )}
    >
      <span className="w-12 shrink-0 pt-0.5 font-mono text-xs text-primary">
        {symbol}
      </span>
      <span className="min-w-0 flex-1 leading-5">{label}</span>
      {active ? <CheckIcon className="mt-0.5 size-4 text-primary" /> : null}
    </button>
  );
}
