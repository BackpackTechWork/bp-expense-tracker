"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string | null;
}

interface FilterSectionProps {
    groupBy: "day" | "week" | "month";
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    categories: Category[];
    onGroupByChange: (groupBy: "day" | "week" | "month") => void;
    onCategoryChange: (categoryId: string) => void;
    onDateRangeChange: (startDate?: string, endDate?: string) => void;
    onClearFilters: () => void;
}

export function FilterSection({
    groupBy,
    categoryId,
    startDate,
    endDate,
    categories,
    onGroupByChange,
    onCategoryChange,
    onDateRangeChange,
    onClearFilters,
}: FilterSectionProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
        startDate ? new Date(startDate) : undefined
    );
    const [localEndDate, setLocalEndDate] = useState<Date | undefined>(
        endDate ? new Date(endDate) : undefined
    );

    const handleDateRangeChange = () => {
        onDateRangeChange(
            localStartDate?.toISOString(),
            localEndDate?.toISOString()
        );
    };

    const clearFilters = () => {
        setLocalStartDate(undefined);
        setLocalEndDate(undefined);
        onClearFilters();
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">
                        Filters
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden flex-shrink-0"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        <span className="hidden xs:inline">Filters</span>
                        {showFilters ? (
                            <ChevronUp className="h-4 w-4 ml-2" />
                        ) : (
                            <ChevronDown className="h-4 w-4 ml-2" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent
                className={cn(
                    "space-y-4",
                    showFilters ? "block" : "hidden md:block"
                )}
            >
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Group By */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <label className="text-sm font-medium">Group By</label>
                        <Select value={groupBy} onValueChange={onGroupByChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">Day</SelectItem>
                                <SelectItem value="week">Week</SelectItem>
                                <SelectItem value="month">Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select
                            value={categoryId || "all"}
                            onValueChange={onCategoryChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Date Range */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <label className="text-sm font-medium">
                            Date Range
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal flex-1",
                                            !localStartDate &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {localStartDate
                                            ? format(localStartDate, "MMM dd")
                                            : "Start"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto  p-0"
                                    align="start"
                                >
                                    <CalendarComponent
                                        mode="single"
                                        selected={localStartDate}
                                        onSelect={setLocalStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal flex-1",
                                            !localEndDate &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {localEndDate
                                            ? format(localEndDate, "MMM dd")
                                            : "End"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <CalendarComponent
                                        mode="single"
                                        selected={localEndDate}
                                        onSelect={setLocalEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                    <Button
                        onClick={handleDateRangeChange}
                        size="default"
                        className="bg-[#DC143C] hover:bg-[#B91C1C] text-white flex-1 sm:flex-none"
                    >
                        Apply Date Filter
                    </Button>
                    <Button
                        onClick={clearFilters}
                        variant="outline"
                        size="default"
                        className="border-gray-300 hover:bg-gray-50 flex-1 sm:flex-none"
                    >
                        Clear Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
