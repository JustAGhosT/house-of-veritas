// Multi-language support for House of Veritas
// Languages: English (default), Afrikaans, Zulu

export type Language = 'en' | 'af' | 'zu'

export const LANGUAGES: Record<Language, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  af: { name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  zu: { name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
}

// Translation keys
export type TranslationKey = keyof typeof translations.en

// Translations
export const translations = {
  en: {
    // Common
    'common.welcome': 'Welcome',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Auth
    'auth.login': 'Sign In',
    'auth.logout': 'Logout',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.welcomeBack': 'Welcome Back',
    'auth.signInAccess': 'Sign in to access your dashboard',
    'auth.invalidCredentials': 'Invalid email or password',
    'auth.connectionError': 'Connection error. Please try again.',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.tasks': 'Tasks',
    'nav.documents': 'Documents',
    'nav.expenses': 'Expenses',
    'nav.time': 'Time & Attendance',
    'nav.vehicles': 'Vehicles',
    'nav.assets': 'Assets',
    'nav.employees': 'Employees',
    'nav.settings': 'Settings',
    'nav.reports': 'Reports',
    
    // Dashboard
    'dashboard.overview': 'Overview',
    'dashboard.pendingTasks': 'Pending Tasks',
    'dashboard.completedTasks': 'Completed Tasks',
    'dashboard.monthlyExpenses': 'Monthly Expenses',
    'dashboard.documentsDigitized': 'Documents Digitized',
    'dashboard.activeEmployees': 'Active Employees',
    'dashboard.pendingApprovals': 'Pending Approvals',
    'dashboard.recentActivity': 'Recent Activity',
    
    // Tasks
    'tasks.myTasks': 'My Tasks',
    'tasks.allTasks': 'All Tasks',
    'tasks.newTask': 'New Task',
    'tasks.assignee': 'Assignee',
    'tasks.dueDate': 'Due Date',
    'tasks.priority': 'Priority',
    'tasks.status': 'Status',
    'tasks.completed': 'Completed',
    'tasks.inProgress': 'In Progress',
    'tasks.pending': 'Pending',
    'tasks.overdue': 'Overdue',
    
    // Expenses
    'expenses.submit': 'Submit Expense',
    'expenses.amount': 'Amount',
    'expenses.category': 'Category',
    'expenses.description': 'Description',
    'expenses.receipt': 'Receipt',
    'expenses.approved': 'Approved',
    'expenses.rejected': 'Rejected',
    'expenses.pendingApproval': 'Pending Approval',
    
    // Time
    'time.clockIn': 'Clock In',
    'time.clockOut': 'Clock Out',
    'time.hoursToday': 'Hours Today',
    'time.hoursThisWeek': 'Hours This Week',
    'time.overtime': 'Overtime',
    
    // Documents
    'documents.sign': 'Sign Document',
    'documents.download': 'Download',
    'documents.expiring': 'Expiring Soon',
    'documents.expired': 'Expired',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markRead': 'Mark as read',
    'notifications.markAllRead': 'Mark all as read',
    'notifications.clear': 'Clear all',
    'notifications.empty': 'No notifications',
    
    // Settings
    'settings.profile': 'Profile',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.notifications': 'Notifications',
    
    // Reports
    'reports.generate': 'Generate Report',
    'reports.export': 'Export',
    'reports.dateRange': 'Date Range',
    'reports.expenseReport': 'Expense Report',
    'reports.taskReport': 'Task Report',
    'reports.timeReport': 'Time Report',
    
    // Status messages
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.live': 'Live',
    'status.syncing': 'Syncing...',
  },
  
  af: {
    // Common
    'common.welcome': 'Welkom',
    'common.back': 'Terug',
    'common.next': 'Volgende',
    'common.save': 'Stoor',
    'common.cancel': 'Kanselleer',
    'common.delete': 'Verwyder',
    'common.edit': 'Wysig',
    'common.view': 'Bekyk',
    'common.search': 'Soek',
    'common.filter': 'Filter',
    'common.loading': 'Laai...',
    'common.error': 'Fout',
    'common.success': 'Sukses',
    'common.confirm': 'Bevestig',
    'common.yes': 'Ja',
    'common.no': 'Nee',
    
    // Auth
    'auth.login': 'Teken In',
    'auth.logout': 'Teken Uit',
    'auth.email': 'E-posadres',
    'auth.password': 'Wagwoord',
    'auth.forgotPassword': 'Wagwoord vergeet?',
    'auth.welcomeBack': 'Welkom Terug',
    'auth.signInAccess': 'Teken in om toegang tot jou dashboard te kry',
    'auth.invalidCredentials': 'Ongeldige e-pos of wagwoord',
    'auth.connectionError': 'Verbindingsfout. Probeer asseblief weer.',
    
    // Navigation
    'nav.dashboard': 'Kontroleskerm',
    'nav.tasks': 'Take',
    'nav.documents': 'Dokumente',
    'nav.expenses': 'Uitgawes',
    'nav.time': 'Tyd & Bywoning',
    'nav.vehicles': 'Voertuie',
    'nav.assets': 'Bates',
    'nav.employees': 'Werknemers',
    'nav.settings': 'Instellings',
    'nav.reports': 'Verslae',
    
    // Dashboard
    'dashboard.overview': 'Oorsig',
    'dashboard.pendingTasks': 'Hangende Take',
    'dashboard.completedTasks': 'Voltooide Take',
    'dashboard.monthlyExpenses': 'Maandelikse Uitgawes',
    'dashboard.documentsDigitized': 'Dokumente Gedigitaliseer',
    'dashboard.activeEmployees': 'Aktiewe Werknemers',
    'dashboard.pendingApprovals': 'Hangende Goedkeurings',
    'dashboard.recentActivity': 'Onlangse Aktiwiteit',
    
    // Tasks
    'tasks.myTasks': 'My Take',
    'tasks.allTasks': 'Alle Take',
    'tasks.newTask': 'Nuwe Taak',
    'tasks.assignee': 'Toegewysde',
    'tasks.dueDate': 'Vervaldatum',
    'tasks.priority': 'Prioriteit',
    'tasks.status': 'Status',
    'tasks.completed': 'Voltooi',
    'tasks.inProgress': 'Besig',
    'tasks.pending': 'Hangend',
    'tasks.overdue': 'Agterstallig',
    
    // Expenses
    'expenses.submit': 'Dien Uitgawe In',
    'expenses.amount': 'Bedrag',
    'expenses.category': 'Kategorie',
    'expenses.description': 'Beskrywing',
    'expenses.receipt': 'Kwitansie',
    'expenses.approved': 'Goedgekeur',
    'expenses.rejected': 'Afgekeur',
    'expenses.pendingApproval': 'Wag vir Goedkeuring',
    
    // Time
    'time.clockIn': 'Klok In',
    'time.clockOut': 'Klok Uit',
    'time.hoursToday': 'Ure Vandag',
    'time.hoursThisWeek': 'Ure Hierdie Week',
    'time.overtime': 'Oortyd',
    
    // Documents
    'documents.sign': 'Teken Dokument',
    'documents.download': 'Laai Af',
    'documents.expiring': 'Verval Binnekort',
    'documents.expired': 'Verval',
    
    // Notifications
    'notifications.title': 'Kennisgewings',
    'notifications.markRead': 'Merk as gelees',
    'notifications.markAllRead': 'Merk alles as gelees',
    'notifications.clear': 'Maak alles skoon',
    'notifications.empty': 'Geen kennisgewings',
    
    // Settings
    'settings.profile': 'Profiel',
    'settings.language': 'Taal',
    'settings.theme': 'Tema',
    'settings.notifications': 'Kennisgewings',
    
    // Reports
    'reports.generate': 'Genereer Verslag',
    'reports.export': 'Uitvoer',
    'reports.dateRange': 'Datumreeks',
    'reports.expenseReport': 'Uitgaweverslag',
    'reports.taskReport': 'Taakverslag',
    'reports.timeReport': 'Tydverslag',
    
    // Status messages
    'status.online': 'Aanlyn',
    'status.offline': 'Aflyn',
    'status.live': 'Lewendig',
    'status.syncing': 'Sinkroniseer...',
  },
  
  zu: {
    // Common
    'common.welcome': 'Siyakwamukela',
    'common.back': 'Emuva',
    'common.next': 'Okulandelayo',
    'common.save': 'Londoloza',
    'common.cancel': 'Khansela',
    'common.delete': 'Susa',
    'common.edit': 'Hlela',
    'common.view': 'Buka',
    'common.search': 'Sesha',
    'common.filter': 'Hlunga',
    'common.loading': 'Iyalayisha...',
    'common.error': 'Iphutha',
    'common.success': 'Impumelelo',
    'common.confirm': 'Qinisekisa',
    'common.yes': 'Yebo',
    'common.no': 'Cha',
    
    // Auth
    'auth.login': 'Ngena',
    'auth.logout': 'Phuma',
    'auth.email': 'Ikheli Le-imeyili',
    'auth.password': 'Iphasiwedi',
    'auth.forgotPassword': 'Ukhohlwe iphasiwedi?',
    'auth.welcomeBack': 'Siyakwamukela Futhi',
    'auth.signInAccess': 'Ngena ukuze ufinyelele idashbhodi yakho',
    'auth.invalidCredentials': 'I-imeyili noma iphasiwedi engalungile',
    'auth.connectionError': 'Iphutha lokuxhumana. Sicela uzame futhi.',
    
    // Navigation
    'nav.dashboard': 'Idashbhodi',
    'nav.tasks': 'Imisebenzi',
    'nav.documents': 'Amadokhumende',
    'nav.expenses': 'Izindleko',
    'nav.time': 'Isikhathi Nokuba Khona',
    'nav.vehicles': 'Izimoto',
    'nav.assets': 'Impahla',
    'nav.employees': 'Abasebenzi',
    'nav.settings': 'Izilungiselelo',
    'nav.reports': 'Imibiko',
    
    // Dashboard
    'dashboard.overview': 'Ukubuka Konke',
    'dashboard.pendingTasks': 'Imisebenzi Elindile',
    'dashboard.completedTasks': 'Imisebenzi Eqediwe',
    'dashboard.monthlyExpenses': 'Izindleko Zenyanga',
    'dashboard.documentsDigitized': 'Amadokhumende Adijithaliziwe',
    'dashboard.activeEmployees': 'Abasebenzi Abasebenzayo',
    'dashboard.pendingApprovals': 'Izimvume Ezilindile',
    'dashboard.recentActivity': 'Umsebenzi Wamuva',
    
    // Tasks
    'tasks.myTasks': 'Imisebenzi Yami',
    'tasks.allTasks': 'Yonke Imisebenzi',
    'tasks.newTask': 'Umsebenzi Omusha',
    'tasks.assignee': 'Onikwe Umsebenzi',
    'tasks.dueDate': 'Usuku Lokugcina',
    'tasks.priority': 'Ukubaluleka',
    'tasks.status': 'Isimo',
    'tasks.completed': 'Kuqediwe',
    'tasks.inProgress': 'Kusaqhubeka',
    'tasks.pending': 'Kulindile',
    'tasks.overdue': 'Kuphuze',
    
    // Expenses
    'expenses.submit': 'Thumela Izindleko',
    'expenses.amount': 'Inani',
    'expenses.category': 'Isigaba',
    'expenses.description': 'Incazelo',
    'expenses.receipt': 'Irisidi',
    'expenses.approved': 'Kwamukelwe',
    'expenses.rejected': 'Kwenqatshiwe',
    'expenses.pendingApproval': 'Kulinde Ukwamukelwa',
    
    // Time
    'time.clockIn': 'Ngena Emsebenzini',
    'time.clockOut': 'Phuma Emsebenzini',
    'time.hoursToday': 'Amahora Namuhla',
    'time.hoursThisWeek': 'Amahora Kuleviki',
    'time.overtime': 'Isikhathi Esengeziwe',
    
    // Documents
    'documents.sign': 'Sayina Idokhumende',
    'documents.download': 'Landa',
    'documents.expiring': 'Kuzophela Maduzane',
    'documents.expired': 'Kuphelile',
    
    // Notifications
    'notifications.title': 'Izaziso',
    'notifications.markRead': 'Maka njengokufundiwe',
    'notifications.markAllRead': 'Maka konke njengokufundiwe',
    'notifications.clear': 'Sula konke',
    'notifications.empty': 'Azikho izaziso',
    
    // Settings
    'settings.profile': 'Iphrofayili',
    'settings.language': 'Ulimi',
    'settings.theme': 'Indikimba',
    'settings.notifications': 'Izaziso',
    
    // Reports
    'reports.generate': 'Yakha Umbiko',
    'reports.export': 'Thumela Ngaphandle',
    'reports.dateRange': 'Izinsuku',
    'reports.expenseReport': 'Umbiko Wezindleko',
    'reports.taskReport': 'Umbiko Wemisebenzi',
    'reports.timeReport': 'Umbiko Wesikhathi',
    
    // Status messages
    'status.online': 'Ku-inthanethi',
    'status.offline': 'Awukho ku-inthanethi',
    'status.live': 'Bukhoma',
    'status.syncing': 'Kuyavumelana...',
  },
} as const

// Get translation
export function t(key: TranslationKey, lang: Language = 'en'): string {
  return translations[lang][key] || translations.en[key] || key
}

// Translation hook context type
export interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}
