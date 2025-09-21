export const getWeekDates = (date: Date): Date[] => {
  const week = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  
  return week;
};

export const getMonthDates = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const dates = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const getHourlyPostsForDay = (date: Date, posts: any[]): { [key: number]: any[] } => {
  const dayPosts = posts.filter(post => {
    const postDate = new Date(post.scheduled_date);
    return postDate.toDateString() === date.toDateString();
  });
  
  const hourlyPosts: { [key: number]: any[] } = {};
  
  for (let hour = 0; hour < 24; hour++) {
    hourlyPosts[hour] = dayPosts.filter(post => 
      new Date(post.scheduled_date).getHours() === hour
    );
  }
  
  return hourlyPosts;
};

export const getPostsForDate = (date: Date, posts: any[]): any[] => {
  return posts.filter(post => {
    const postDate = new Date(post.scheduled_date);
    return postDate.toDateString() === date.toDateString();
  });
};

export const formatCalendarTitle = (currentDate: Date, calendarView: string): string => {
  if (calendarView === 'day') {
    return currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } else if (calendarView === 'week') {
    const weekDates = getWeekDates(currentDate);
    const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}, ${weekDates[0].getFullYear()}`;
  } else {
    return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
};

export const navigateCalendar = (currentDate: Date, direction: 'prev' | 'next', calendarView: string): Date => {
  const newDate = new Date(currentDate);
  
  if (calendarView === 'day') {
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
  } else if (calendarView === 'week') {
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
  } else if (calendarView === 'month') {
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
  }
  
  return newDate;
};
