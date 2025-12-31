export const PERMISSIONS: any = {
  admin: [
    "dashboard",
    "students",
    "teachers",
    "classes",
    "attendance",
    "fees",
    "timetable",
    "exams",
    "notifications",
    "events",
    "transport",
    "meal-plan",
    "gallery",
    "settings"
  ],

  teacher: [
    "dashboard",
    "attendance",
    "timetable",
    "exams",
    "notifications",
    "events"
  ],

  parent: [
    "dashboard",
    "parent-portal",
    "gallery",
    "meal-plan",
    "notifications"
  ]
};

export function canAccess(role: string, module: string) {
  return PERMISSIONS[role]?.includes(module);
}
