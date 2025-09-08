"use client";

import { format } from "date-fns";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string | null;
}

interface FilterChip {
    type: "category" | "startDate" | "endDate";
    label: string;
    value: string;
}

interface ActiveFilterChipsProps {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    categories: Category[];
    onRemoveFilter: (filterType: "category" | "startDate" | "endDate") => void;
}

export function ActiveFilterChips({
    categoryId,
    startDate,
    endDate,
    categories,
    onRemoveFilter,
}: ActiveFilterChipsProps) {
    const getActiveFilters = (): FilterChip[] => {
        const activeFilters: FilterChip[] = [];

        if (categoryId) {
            const category = categories.find((c) => c.id === categoryId);
            if (category) {
                activeFilters.push({
                    type: "category",
                    label: category.name,
                    value: categoryId,
                });
            }
        }

        if (startDate) {
            activeFilters.push({
                type: "startDate",
                label: `From ${format(new Date(startDate), "MMM dd, yyyy")}`,
                value: startDate,
            });
        }

        if (endDate) {
            activeFilters.push({
                type: "endDate",
                label: `To ${format(new Date(endDate), "MMM dd, yyyy")}`,
                value: endDate,
            });
        }

        return activeFilters;
    };

    const activeFilters = getActiveFilters();

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <Card className="shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                        Active filters:
                    </span>
                    {activeFilters.map((filter) => (
                        <Badge
                            key={`${filter.type}-${filter.value}`}
                            variant="secondary"
                            className="bg-[#DC143C] text-white hover:bg-[#B91C1C] rounded-full text-xs px-3 py-1 flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => onRemoveFilter(filter.type)}
                        >
                            {filter.label}
                            <X className="h-3 w-3 ml-1" />
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
