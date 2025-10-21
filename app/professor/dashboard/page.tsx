"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CoursesCalendar } from "@/components/courses/courses-calendar";
import { CourseDetailsModal } from "@/components/courses/course-details-modal";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  List,
  Calendar as CalendarIcon,
  CalendarDays,
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock
} from "lucide-react";

export default function ProfessorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    clientsCount: 0,
    upcomingCourses: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
  });
  const [upcomingCourses, setUpcomingCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const getCourseStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          border: "border-l-green-500",
          borderHover: "hover:border-l-green-600",
          badge: "bg-green-50 text-green-700 hover:bg-green-100",
        };
      case "CANCELLED":
        return {
          border: "border-l-red-500",
          borderHover: "hover:border-l-red-600",
          badge: "bg-red-50 text-red-700 hover:bg-red-100",
        };
      case "SCHEDULED":
      default:
        return {
          border: "border-l-blue-500",
          borderHover: "hover:border-l-blue-600",
          badge: "bg-blue-50 text-blue-700 hover:bg-blue-100",
        };
    }
  };

  const loadData = () => {
    // Charger les statistiques
    fetch("/api/professor/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));

    // Charger les cours à venir (limités pour la liste)
    fetch("/api/professor/courses?upcoming=true&limit=10")
      .then((res) => res.json())
      .then((data) => {
        setUpcomingCourses(data);
        // Charger tous les cours pour le calendrier
        return fetch("/api/professor/courses?upcoming=true&limit=100");
      })
      .then((res) => res.json())
      .then((data) => setAllCourses(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Bonjour, {session?.user?.firstName} ! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.clientsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Clients actifs</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cours à venir
            </CardTitle>
            <BookOpen className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.upcomingCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Cours planifiés</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures en attente
            </CardTitle>
            <FileText className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">À encaisser</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-purple-100 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus du mois
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Factures payées</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Section with Tabs */}
      <Card className="border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Mes cours</CardTitle>
              <CardDescription className="mt-1">
                Gérez et consultez vos cours à venir
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Liste</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Semaine</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Mois</span>
              </TabsTrigger>
            </TabsList>

            {/* List View */}
            <TabsContent value="list" className="space-y-4 mt-6">
              {upcomingCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-blue-50 p-4 mb-4">
                    <CalendarIcon className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun cours à venir</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Vous n'avez pas de cours planifiés pour le moment
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingCourses.map((course) => {
                    const colors = getCourseStatusColor(course.status);
                    return (
                      <Card
                        key={course.id}
                        className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${colors.border} ${colors.borderHover}`}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <CardContent className="flex items-center justify-between p-5">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                              <Badge variant="secondary" className={colors.badge}>
                                {course.subject}
                              </Badge>
                            </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {course.client?.firstName} {course.client?.lastName}
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon className="h-4 w-4" />
                              {formatDateTime(course.date)}
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {course.duration} min
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(course.price)}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Week View */}
            <TabsContent value="week">
              <CoursesCalendar courses={allCourses} view="week" onCourseClick={setSelectedCourse} />
            </TabsContent>

            {/* Month View */}
            <TabsContent value="month">
              <CoursesCalendar courses={allCourses} view="month" onCourseClick={setSelectedCourse} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
