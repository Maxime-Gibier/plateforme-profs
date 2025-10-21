"use client";

import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addDays, isSameMonth, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number;
  price: number;
  status: string;
  client: {
    firstName: string;
    lastName: string;
  };
}

interface CoursesCalendarProps {
  courses: Course[];
  view: "week" | "month";
  onCourseClick?: (course: Course) => void;
}

export function CoursesCalendar({ courses, view, onCourseClick }: CoursesCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const startDate = view === "week" ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfMonth(currentDate);
  const endDate = view === "week" ? endOfWeek(currentDate, { weekStartsOn: 1 }) : endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevious = () => {
    if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getPeriodTitle = () => {
    if (view === "week") {
      return `Semaine du ${format(startDate, "d MMM", { locale: fr })} au ${format(endDate, "d MMM yyyy", { locale: fr })}`;
    } else {
      return format(currentDate, "MMMM yyyy", { locale: fr });
    }
  };

  const getCoursesForDay = (day: Date) => {
    return courses.filter(course => isSameDay(new Date(course.date), day));
  };

  const getCourseStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          bg: "bg-green-100",
          hover: "hover:bg-green-200",
          text: "text-green-700",
          textDark: "text-green-900",
        };
      case "CANCELLED":
        return {
          bg: "bg-red-100",
          hover: "hover:bg-red-200",
          text: "text-red-700",
          textDark: "text-red-900",
        };
      case "SCHEDULED":
      default:
        return {
          bg: "bg-blue-100",
          hover: "hover:bg-blue-200",
          text: "text-blue-700",
          textDark: "text-blue-900",
        };
    }
  };

  if (view === "week") {
    return (
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {getPeriodTitle()}
            </h3>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          {/* Header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`border-r border-gray-200 p-4 text-center last:border-r-0 ${
                isToday(day) ? "bg-blue-50" : ""
              }`}
            >
              <div className="text-xs font-medium uppercase text-gray-500">
                {format(day, "EEE", { locale: fr })}
              </div>
              <div
                className={`mt-1 text-2xl font-semibold ${
                  isToday(day) ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {days.map((day) => {
            const dayCourses = getCoursesForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[200px] p-2 ${
                  isToday(day) ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="space-y-1">
                  {dayCourses.map((course) => {
                    const colors = getCourseStatusColor(course.status);
                    return (
                      <div
                        key={course.id}
                        className={`rounded-md ${colors.bg} p-2 text-xs ${colors.hover} transition-colors cursor-pointer`}
                        onClick={() => onCourseClick?.(course)}
                      >
                        <div className={`font-semibold ${colors.textDark}`}>
                          {format(new Date(course.date), "HH:mm")}
                        </div>
                        <div className={`${colors.text} line-clamp-2`}>{course.title}</div>
                        <div className={`mt-1 ${colors.text}`}>
                          {course.client.firstName} {course.client.lastName}
                        </div>
                      </div>
                    );
                  })}
                  {dayCourses.length === 0 && (
                    <div className="text-center text-xs text-gray-400 py-4">
                      Aucun cours
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    );
  }

  // Month view
  const weeks: Date[][] = [];
  let week: Date[] = [];

  days.forEach((day, index) => {
    week.push(day);
    if ((index + 1) % 7 === 0 || index === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {getPeriodTitle()}
          </h3>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div
            key={day}
            className="border-r border-gray-200 p-2 text-center text-xs font-semibold uppercase text-gray-600 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
          {week.map((day) => {
            const dayCourses = getCoursesForDay(day);
            const isCurrentMonth = isSameMonth(day, today);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] border-r border-gray-200 p-2 last:border-r-0 ${
                  !isCurrentMonth ? "bg-gray-50" : ""
                } ${isToday(day) ? "bg-blue-50" : ""}`}
              >
                <div
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                    isToday(day)
                      ? "bg-blue-600 font-bold text-white"
                      : isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="mt-1 space-y-1">
                  {dayCourses.slice(0, 2).map((course) => {
                    const colors = getCourseStatusColor(course.status);
                    return (
                      <div
                        key={course.id}
                        className={`rounded ${colors.bg} px-1 py-0.5 text-[10px] font-medium ${colors.text} ${colors.hover} transition-colors cursor-pointer truncate`}
                        title={`${format(new Date(course.date), "HH:mm")} - ${course.title}`}
                        onClick={() => onCourseClick?.(course)}
                      >
                        {format(new Date(course.date), "HH:mm")} {course.title}
                      </div>
                    );
                  })}
                  {dayCourses.length > 2 && (
                    <div className="text-[10px] text-gray-500">
                      +{dayCourses.length - 2} cours
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      </div>
    </div>
  );
}
