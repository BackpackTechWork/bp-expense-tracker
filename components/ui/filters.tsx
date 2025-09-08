"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchFilter({
    value,
    onChange,
    placeholder = "Search...",
    className,
}: SearchFilterProps) {
    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 pr-10"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}

interface SelectFilterProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}

export function SelectFilter({
    value,
    onChange,
    options,
    placeholder = "Select...",
    className,
}: SelectFilterProps) {
    return (
        <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger className={cn("w-full", className)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

interface FilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    filters?: {
        key: string;
        label: string;
        value: string;
        onChange: (value: string) => void;
        options: { value: string; label: string }[];
        placeholder?: string;
    }[];
    onClearAll?: () => void;
    showClearAll?: boolean;
    className?: string;
}

export function FilterBar({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    filters = [],
    onClearAll,
    showClearAll = true,
    className,
}: FilterBarProps) {
    const hasActiveFilters =
        searchValue || filters.some((filter) => filter.value);

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchFilter
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                    />
                </div>

                {filters.map((filter) => (
                    <div key={filter.key} className="w-full sm:w-48">
                        <SelectFilter
                            value={filter.value}
                            onChange={filter.onChange}
                            options={filter.options}
                            placeholder={filter.placeholder || filter.label}
                        />
                    </div>
                ))}

                {showClearAll && hasActiveFilters && onClearAll && (
                    <Button
                        variant="outline"
                        onClick={onClearAll}
                        className="w-full sm:w-auto"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="h-4 w-4" />
                    <span>Active filters:</span>
                    {searchValue && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Search: &quot;{searchValue}&quot;
                        </span>
                    )}
                    {filters.map((filter) => {
                        if (!filter.value || filter.value === "all")
                            return null;
                        const option = filter.options.find(
                            (opt) => opt.value === filter.value
                        );
                        return (
                            <span
                                key={filter.key}
                                className="bg-green-100 text-green-800 px-2 py-1 rounded"
                            >
                                {filter.label}: {option?.label || filter.value}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
