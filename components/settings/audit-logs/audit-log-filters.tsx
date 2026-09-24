'use client';

import { Input } from '@/components/ui/input';
import { Search, X, CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface AuditLogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedModules: string[];
  onModulesChange: (modules: string[]) => void;
  selectedActions: string[];
  onActionsChange: (actions: string[]) => void;
  selectedActor: string;
  onActorChange: (actor: string) => void;
  dateFrom?: Date;
  onDateFromChange: (date?: Date) => void;
  dateTo?: Date;
  onDateToChange: (date?: Date) => void;
  filterOptions: {
    modules: string[];
    actions: string[];
    actors: Array<{ id: number; name: string }>;
  };
  activeFilterCount: number;
  onReset: () => void;
}

export function AuditLogFilters({
  search,
  onSearchChange,
  selectedModules,
  onModulesChange,
  selectedActions,
  onActionsChange,
  selectedActor,
  onActorChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  filterOptions,
  activeFilterCount,
  onReset,
}: AuditLogFiltersProps) {
  const toggleModule = (module: string) => {
    onModulesChange(
      selectedModules.includes(module)
        ? selectedModules.filter((m) => m !== module)
        : [...selectedModules, module]
    );
  };

  const toggleAction = (action: string) => {
    onActionsChange(
      selectedActions.includes(action)
        ? selectedActions.filter((a) => a !== action)
        : [...selectedActions, action]
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama aktor, entitas, ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Module Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-dashed border-input bg-transparent px-3 py-1 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Modul
              {selectedModules.length > 0 && (
                <>
                  <span className="mx-2 h-4 w-px bg-border" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedModules.length}
                  </Badge>
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {filterOptions.modules.map((module) => (
                <DropdownMenuCheckboxItem
                  key={module}
                  checked={selectedModules.includes(module)}
                  onCheckedChange={() => toggleModule(module)}
                >
                  {module}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Action Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-dashed border-input bg-transparent px-3 py-1 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Aksi
              {selectedActions.length > 0 && (
                <>
                  <span className="mx-2 h-4 w-px bg-border" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedActions.length}
                  </Badge>
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {filterOptions.actions.map((action) => (
                <DropdownMenuCheckboxItem
                  key={action}
                  checked={selectedActions.includes(action)}
                  onCheckedChange={() => toggleAction(action)}
                >
                  {action}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Actor Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-dashed border-input bg-transparent px-3 py-1 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Aktor
              {selectedActor && (
                <>
                  <span className="mx-2 h-4 w-px bg-border" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">1</Badge>
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuRadioGroup value={selectedActor} onValueChange={onActorChange}>
                <DropdownMenuRadioItem value="">Semua Aktor</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                {filterOptions.actors.map((actor) => (
                  <DropdownMenuRadioItem key={actor.id} value={String(actor.id)}>
                    {actor.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Picker Range */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger className={cn(
                "inline-flex h-9 items-center whitespace-nowrap rounded-md border border-dashed border-input bg-transparent px-3 py-1 text-sm font-normal shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 justify-start text-left",
                !dateFrom && "text-muted-foreground"
              )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'dd MMM yyyy', { locale: id }) : <span>Dari Tanggal</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={onDateFromChange}
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">-</span>
            <Popover>
              <PopoverTrigger className={cn(
                "inline-flex h-9 items-center whitespace-nowrap rounded-md border border-dashed border-input bg-transparent px-3 py-1 text-sm font-normal shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 justify-start text-left",
                !dateTo && "text-muted-foreground"
              )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'dd MMM yyyy', { locale: id }) : <span>Sampai Tanggal</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={onDateToChange}
                />
              </PopoverContent>
            </Popover>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
