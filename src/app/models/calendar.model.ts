export interface UserDropdown {
  userId: number;
  userName: string;
  employeeId: string;
  roleName: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string | null;
  eventType: 'VISIT' | 'DEMO';
  color: string;
}

export interface CalendarResponse {
  userId: number;
  visitEvents: CalendarEvent[];
  demoEvents: CalendarEvent[];
}

export interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  currentMonth: boolean;
}