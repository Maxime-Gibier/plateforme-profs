"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [upcomingCourses, setUpcomingCourses] = useState<any[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);

  useEffect(() => {
    // Charger les cours à venir
    fetch("/api/client/courses?upcoming=true")
      .then((res) => res.json())
      .then((data) => setUpcomingCourses(data))
      .catch((err) => console.error(err));

    // Charger les factures en attente
    fetch("/api/client/invoices?status=pending")
      .then((res) => res.json())
      .then((data) => setPendingInvoices(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {session?.user?.firstName} !
        </h1>
        <p className="text-gray-600">Voici vos cours à venir et factures en attente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prochains cours</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingCourses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun cours à venir
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.subject}</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(course.date)} - {course.duration} min
                    </p>
                    <p className="text-sm font-semibold text-indigo-600 mt-2">
                      {formatCurrency(course.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Factures à payer</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune facture en attente
              </p>
            ) : (
              <div className="space-y-4">
                {pendingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-gray-500">
                          Échéance : {formatDateTime(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(invoice.totalAmount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          invoice.status === "OVERDUE"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {invoice.status === "OVERDUE" ? "En retard" : "En attente"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
