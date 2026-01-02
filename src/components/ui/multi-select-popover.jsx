
import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

export function MultiSelectPopover({
  options,
  selected,
  onChange,
  className,
  placeholder = "Selecione...",
  triggerIcon,
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };
  
  const handleUnselect = (value) => {
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-[40px]", className)}
        >
          <div className="flex gap-1.5 flex-wrap items-center">
            {triggerIcon && !selected.length ? <span className="mr-2">{triggerIcon}</span> : null}
            {selected.length > 0 ? (
              selected.map((value) => (
                <Badge
                  variant="secondary"
                  key={value}
                  className="rounded-md"
                  onClick={(e) => {
                      e.stopPropagation(); // Evita que o Popover feche
                      handleUnselect(value);
                  }}
                >
                  {value}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar funil..." />
          <CommandList>
            <CommandEmpty>Nenhum funil encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <CommandItem
                    key={option}
                    onSelect={() => handleSelect(option)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "opacity-50 [&_svg]:invisible border-primary"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
