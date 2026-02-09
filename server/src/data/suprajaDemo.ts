/**
 * Supraja Foundation project demo data from Activity & Budget reports
 * Used when MongoDB is not available
 */

export const SUPRAJA_PROJECT = {
  _id: 'demo-supraja-project',
  name: 'Supraja Foundation - FPO Development',
  code: 'SUPRAJA',
  donor: 'FWWB / Donor',
  partner: 'pt1',
  status: 'active',
};

/** Second demo program to show multiple programs in Programs module */
export const DEMO_PROJECT_2 = {
  _id: 'demo-program-2',
  name: 'North East Livelihood Promotion',
  code: 'NELPS',
  donor: 'FWWB India',
  partner: 'pt3',
  status: 'active',
};

export const SUPRAJA_ACTIVITIES = [
  { _id: 'a1', activityId: 'SUPRAJA-2024-001', name: 'Training on FE & BMS - Level 1', quarter: 'Oct - Dec 2022', date: '10th - 12th Oct', location: 'Phesama - Nagaland', expectedParticipants: 25, actualParticipants: 66, budget: 11250, expenses: 9900, variance: -1350, status: 'completed', billStatus: 'Paid', project: SUPRAJA_PROJECT, achievementRate: 264, budgetHead: 'Direct Cost - Training' },
  { _id: 'a2', activityId: 'SUPRAJA-2024-002', name: 'Training on FE & BMS - Level 2', quarter: 'Oct - Dec 2022', date: '24th & 25th Oct', location: 'Phesama - Nagaland', expectedParticipants: 25, actualParticipants: 44, budget: 7500, expenses: 6600, variance: -900, status: 'completed', billStatus: 'Paid', project: SUPRAJA_PROJECT, achievementRate: 176, budgetHead: 'Direct Cost - Training' },
  { _id: 'a3', activityId: 'SUPRAJA-2024-003', name: 'Training on Skill Development', quarter: 'Oct - Dec 2022', date: '1st - 3rd Nov', location: 'Ahmedabad - Gujarat', expectedParticipants: 25, actualParticipants: 45, budget: 45000, expenses: 54000, variance: 9000, status: 'completed', billStatus: 'Paid', project: SUPRAJA_PROJECT, achievementRate: 180, budgetHead: 'Direct Cost - Training' },
  { _id: 'a4', activityId: 'SUPRAJA-2024-004', name: 'Training on developing business plans', quarter: 'Oct - Dec 2022', date: '7th - 9th Nov', location: 'Jakhama - Nagaland', expectedParticipants: 25, actualParticipants: 30, budget: 11250, expenses: 4500, variance: -6750, status: 'completed', billStatus: 'Paid', project: SUPRAJA_PROJECT, achievementRate: 120, budgetHead: 'Support to 360 beneficiaries' },
  { _id: 'a5', activityId: 'SUPRAJA-2024-005', name: 'Partner NGOs Meet', quarter: 'Oct - Dec 2022', date: '14th & 15th Nov', location: 'Ahmedabad - Gujarat', expectedParticipants: 40, actualParticipants: 50, budget: 450000, expenses: 585000, variance: 135000, status: 'completed', billStatus: 'Paid', project: SUPRAJA_PROJECT, budgetHead: 'Partner NGOs Meet' },
  { _id: 'a6', activityId: 'SUPRAJA-2024-006', name: 'Training of Trainers', quarter: 'Oct - Dec 2022', date: '21st & 22nd Nov', location: 'Imphal - Manipur', expectedParticipants: 40, actualParticipants: 50, budget: 450000, expenses: 585000, variance: 135000, status: 'completed', billStatus: 'Paid', project: SUPRAJA_PROJECT, budgetHead: 'Training of Trainers' },
  { _id: 'a7', activityId: 'SUPRAJA-2024-007', name: 'Workbook Printing', quarter: 'Oct - Dec 2022', date: '28th - 30th Nov', location: 'Ahmedabad - Gujarat', expectedParticipants: 3000, actualParticipants: 3000, budget: 750000, expenses: 750000, variance: 0, status: 'completed', billStatus: 'Paid', project: SUPRAJA_PROJECT, budgetHead: 'Workbook/training material cost' },
];

export const SUPRAJA_BUDGET = [
  { _id: 'b1', head: 'Head A: Direct Cost - Training of Mass Beneficiaries', allocated: 63750, spent: 66500, variance: 2750, variancePct: 4.3, utilizationPct: 104.3, activities: 3, project: SUPRAJA_PROJECT, financialYear: '2024-25' },
  { _id: 'b2', head: 'Head A: Direct Cost - Support to 360 beneficiaries', allocated: 11250, spent: 4500, variance: -6750, variancePct: -60.0, utilizationPct: 40.0, activities: 1, project: SUPRAJA_PROJECT, financialYear: '2024-25' },
  { _id: 'b3', head: 'Head A: Direct Cost - Partner NGOs Meet', allocated: 450000, spent: 585000, variance: 135000, variancePct: 30.0, utilizationPct: 130.0, activities: 1, project: SUPRAJA_PROJECT, financialYear: '2024-25' },
  { _id: 'b4', head: 'Head A: Direct Cost - Training of Trainers', allocated: 450000, spent: 585000, variance: 135000, variancePct: 30.0, utilizationPct: 130.0, activities: 1, project: SUPRAJA_PROJECT, financialYear: '2024-25' },
  { _id: 'b5', head: 'Head A: Direct Cost - Workbook/training material cost', allocated: 750000, spent: 750000, variance: 0, variancePct: 0.0, utilizationPct: 100.0, activities: 1, project: SUPRAJA_PROJECT, financialYear: '2024-25' },
];

export const DEMO_PROJECTS = [SUPRAJA_PROJECT, DEMO_PROJECT_2];

/** FWWB India team members */
export const FWWB_TEAM = [
  { _id: 'e1', employeeId: 'EMP-001', name: 'S.S.Bhat', email: 's.bhat@fwwbindia.org', department: 'Management', designation: 'Chief Executive Officer', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e2', employeeId: 'EMP-002', name: 'Neha Kansara', email: 'neha.kansara@fwwbindia.org', department: 'Management', designation: 'Chief Operating Officer', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e3', employeeId: 'EMP-003', name: 'Nilanjan Dey Chaudhury', email: 'nilanjan.chaudhury@fwwbindia.org', department: 'Programs', designation: 'Program Head', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e4', employeeId: 'EMP-004', name: 'Himanshu Vaghela', email: 'himanshu.vaghela@fwwbindia.org', department: 'Programs', designation: 'Program Manager', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e5', employeeId: 'EMP-005', name: 'Alexis Muthiah', email: 'alexis.muthiah@fwwbindia.org', department: 'Programs', designation: 'Program Manager', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e6', employeeId: 'EMP-006', name: 'Honey Chauhan', email: 'honey.chauhan@fwwbindia.org', department: 'Programs', designation: 'Program Officer', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e7', employeeId: 'EMP-007', name: 'Kurshid Alam', email: 'kurshid.alam@fwwbindia.org', department: 'Programs', designation: 'Program Officer', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e8', employeeId: 'EMP-008', name: 'Ramya Tambe', email: 'ramya.tambe@fwwbindia.org', department: 'Programs', designation: 'Program Associate', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e9', employeeId: 'EMP-009', name: 'Alito Awomi', email: 'alito.awomi@fwwbindia.org', department: 'Programs', designation: 'Program Associate', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e10', employeeId: 'EMP-010', name: 'Krishti Kami', email: 'krishti.kami@fwwbindia.org', department: 'Programs', designation: 'Project Officer', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e11', employeeId: 'EMP-011', name: 'Kuldip Dixit', email: 'kuldip.dixit@fwwbindia.org', department: 'Programs', designation: 'Project Officer', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e12', employeeId: 'EMP-012', name: 'Madhavi Desai', email: 'madhavi.desai@fwwbindia.org', department: 'Finance', designation: 'Finance Head', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e13', employeeId: 'EMP-013', name: 'Jalpa Adhiya', email: 'jalpa.adhiya@fwwbindia.org', department: 'Finance', designation: 'Sr. Accounts Officer', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e14', employeeId: 'EMP-014', name: 'Krishna Bhavsar', email: 'krishna.bhavsar@fwwbindia.org', department: 'Finance', designation: 'Accounts & Finance', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e15', employeeId: 'EMP-015', name: 'Pankit Shah', email: 'pankit.shah@fwwbindia.org', department: 'IT', designation: 'IT - Program Officer', location: 'Head Office - Ahmedabad', status: 'active' },
  { _id: 'e16', employeeId: 'EMP-016', name: 'Geetaben Parmar', email: 'geetaben.parmar@fwwbindia.org', department: 'Administration', designation: 'Support Staff', location: 'Head Office - Ahmedabad', status: 'active' },
];

/** Donors/funders for Donor Management. Programs reference donor by name (e.g. project.donor). */
export const DEMO_DONORS = [
  { _id: 'donor1', name: 'FWWB / Donor', code: 'FWWB', type: 'institutional', contactPerson: 'Grants Team', contactEmail: 'grants@fwwb.org', status: 'active' },
  { _id: 'donor2', name: 'FWWB India', code: 'FWWB-IN', type: 'foundation', contactPerson: 'Program Lead', contactEmail: 'program@fwwbindia.org', status: 'active' },
  { _id: 'donor3', name: 'External Foundation A', code: 'EXT-A', type: 'foundation', contactEmail: 'contact@extfound.org', status: 'active' },
];

export const DONOR_PROGRAMS = [
  {
    _id: 'demo-supraja-project',
    name: 'Supraja Foundation - FPO Development',
    code: 'SUPRAJA',
    donor: 'FWWB / Donor',
    partner: { name: 'Supraja Foundation', code: 'SUPRAJA' },
    activityCount: 7,
    allocated: 1725000,
    utilized: 2051000,
    utilizationPercent: 119,
  },
];

export const DEMO_EXPENSES = SUPRAJA_ACTIVITIES.filter((a) => (a.expenses ?? 0) > 0).map((a, i) => ({
  _id: `exp${i + 1}`,
  expenseId: `EXP-${a.activityId}`,
  project: SUPRAJA_PROJECT,
  activity: { _id: a._id, name: a.name },
  amount: a.expenses ?? 0,
  category: a.budgetHead ?? 'Program',
  description: a.name,
  date: '2024-11-30',
  submittedBy: { name: 'Program Team' },
  status: 'settled',
}));

export const DEMO_JOBS = [
  { _id: 'j1', title: 'Program Manager', department: 'Programs', location: 'Ahmedabad', postedOn: '2024-12-01', applications: 35, status: 'active' },
  { _id: 'j2', title: 'Finance Officer', department: 'Finance', location: 'Ahmedabad', postedOn: '2024-12-05', applications: 12, status: 'active' },
  { _id: 'j3', title: 'Field Officer - Nagaland', department: 'Programs', location: 'Nagaland', postedOn: '2025-01-10', applications: 8, status: 'active' },
];

export const DEMO_ADMIN_EXPENSES = [
  { _id: 'ae1', expenseId: 'AEXP-2024-089', date: '2024-12-15', category: 'Office Rent', description: 'December Rent - HO', amount: 85000, submittedBy: 'Admin Team', status: 'approved' },
  { _id: 'ae2', expenseId: 'AEXP-2024-090', date: '2024-12-20', category: 'Utilities', description: 'Electricity Bill - December', amount: 18500, submittedBy: 'Admin Team', status: 'pending' },
  { _id: 'ae3', expenseId: 'AEXP-2025-001', date: '2025-01-05', category: 'Office Supplies', description: 'Stationery - January', amount: 12500, submittedBy: 'Admin Team', status: 'pending' },
];

export const DEMO_MONITORING = SUPRAJA_ACTIVITIES.slice(0, 5).map((a, i) => ({
  _id: `mon${i + 1}`,
  entryId: `MON-${a.activityId}`,
  project: SUPRAJA_PROJECT,
  activity: { _id: a._id, name: a.name },
  location: a.location,
  date: '2024-11-30',
  notes: `Field visit completed. ${a.actualParticipants ?? 0} participants attended.`,
  expectedParticipants: a.expectedParticipants,
  actualParticipants: a.actualParticipants,
  collectedBy: { name: 'Program Officer' },
}));

/** Leave requests – using FWWB team */
export const DEMO_LEAVE = [
  { _id: 'lv1', employee: { _id: 'e6', name: 'Honey Chauhan', employeeId: 'EMP-006' }, leaveType: 'Casual Leave', fromDate: '2025-01-10', toDate: '2025-01-12', days: 3, reason: 'Personal work', status: 'pending', approvedBy: null },
  { _id: 'lv2', employee: { _id: 'e10', name: 'Krishti Kami', employeeId: 'EMP-010' }, leaveType: 'Sick Leave', fromDate: '2024-12-20', toDate: '2024-12-21', days: 2, reason: 'Health', status: 'approved', approvedBy: { name: 'Neha Kansara' } },
  { _id: 'lv3', employee: { _id: 'e4', name: 'Himanshu Vaghela', employeeId: 'EMP-004' }, leaveType: 'Earned Leave', fromDate: '2025-02-01', toDate: '2025-02-05', days: 5, reason: 'Family trip', status: 'pending', approvedBy: null },
];

/** Attendance – sample records for employees */
export const DEMO_ATTENDANCE = [
  { _id: 'at1', employee: { _id: 'e1', name: 'S.S.Bhat', employeeId: 'EMP-001' }, date: '2025-02-07', checkIn: '09:00', checkOut: '18:00', status: 'present', notes: '' },
  { _id: 'at2', employee: { _id: 'e6', name: 'Honey Chauhan', employeeId: 'EMP-006' }, date: '2025-02-07', checkIn: '09:15', checkOut: '17:45', status: 'present', notes: '' },
  { _id: 'at3', employee: { _id: 'e4', name: 'Himanshu Vaghela', employeeId: 'EMP-004' }, date: '2025-02-07', status: 'wfh', notes: 'Work from home - field planning' },
  { _id: 'at4', employee: { _id: 'e12', name: 'Madhavi Desai', employeeId: 'EMP-012' }, date: '2025-02-06', checkIn: '09:30', checkOut: '18:30', status: 'present', notes: '' },
  { _id: 'at5', employee: { _id: 'e15', name: 'Pankit Shah', employeeId: 'EMP-015' }, date: '2025-02-06', checkIn: '10:00', checkOut: '18:00', status: 'present', notes: '' },
];

/** Travel requests – program staff travels */
export const DEMO_TRAVEL = [
  { _id: 'tr1', requestId: 'TR-2025-001', employee: { _id: 'e4', name: 'Himanshu Vaghela', employeeId: 'EMP-004' }, purposeOfTravel: 'Partner NGOs review - Nagaland', from: 'Ahmedabad', to: 'Kohima', travelDate: '2025-02-15', mode: 'flight', estimatedCost: 18500, status: 'approved' },
  { _id: 'tr2', requestId: 'TR-2025-002', employee: { _id: 'e10', name: 'Krishti Kami', employeeId: 'EMP-010' }, purposeOfTravel: 'Field visit - Imphal', from: 'Ahmedabad', to: 'Imphal', travelDate: '2025-02-20', mode: 'flight', estimatedCost: 22000, status: 'pending' },
  { _id: 'tr3', requestId: 'TR-2024-090', employee: { _id: 'e3', name: 'Nilanjan Dey Chaudhury', employeeId: 'EMP-003' }, purposeOfTravel: 'Donor meeting', from: 'Ahmedabad', to: 'Delhi', travelDate: '2024-12-10', mode: 'flight', estimatedCost: 15000, status: 'completed' },
];

/** Stationery requests – departments */
export const DEMO_STATIONERY = [
  { _id: 'st1', requestId: 'ST-2025-001', requestedBy: { name: 'Honey Chauhan', username: 'program.user' }, department: 'Programs', purpose: 'training', items: 'A4 Paper, Markers, Flip charts', quantity: '5 reams, 20, 3', dateNeeded: '2025-02-15', date: '2025-02-05', status: 'pending' },
  { _id: 'st2', requestId: 'ST-2024-156', requestedBy: { name: 'Ramya Tambe', username: 'admin' }, department: 'Programs', purpose: 'workshop', items: 'Notebooks, Pens', quantity: '50, 100', dateNeeded: '2024-11-20', date: '2024-11-10', status: 'fulfilled' },
  { _id: 'st3', requestId: 'ST-2025-002', requestedBy: { name: 'Geetaben Parmar', username: 'admin' }, department: 'Administration', purpose: 'general', items: 'Print cartridges, Stationery', quantity: '2, 1 set', dateNeeded: '2025-02-10', date: '2025-02-03', status: 'approved' },
];

/** Calendar events */
export const DEMO_CALENDAR = [
  { _id: 'cal1', title: 'Year End Celebration', type: 'event', date: '2024-12-31', location: 'HO - Conference Hall', participants: 'All Staff', status: 'confirmed' },
  { _id: 'cal2', title: 'Republic Day', type: 'holiday', date: '2025-01-26', status: 'confirmed' },
  { _id: 'cal3', title: 'Quarterly Program Review', type: 'event', date: '2025-02-15', location: 'Head Office', participants: 'Program Team', status: 'confirmed' },
  { _id: 'cal4', title: 'Board Meeting', type: 'event', date: '2025-02-28', location: 'Conference Room', participants: 'Management', status: 'planned' },
  { _id: 'cal5', title: 'Holi', type: 'holiday', date: '2025-03-14', status: 'confirmed' },
];

/** Assets – assigned to employees */
export const DEMO_ASSETS = [
  { _id: 'as1', assetNumber: 'IT-001', name: 'Dell Laptop', category: 'Laptop', type: 'it', cost: 65000, status: 'active', assignedTo: { _id: 'e4', name: 'Himanshu Vaghela', employeeId: 'EMP-004' }, location: 'Head Office' },
  { _id: 'as2', assetNumber: 'IT-002', name: 'HP Printer', category: 'Printer', type: 'it', status: 'active', assignedTo: null, location: 'Finance - HO' },
  { _id: 'as3', assetNumber: 'IT-003', name: 'MacBook Pro', category: 'Laptop', type: 'it', cost: 125000, status: 'active', assignedTo: { _id: 'e3', name: 'Nilanjan Dey Chaudhury', employeeId: 'EMP-003' }, location: 'Head Office' },
  { _id: 'as4', assetNumber: 'IT-004', name: 'Lenovo ThinkPad', category: 'Laptop', type: 'it', cost: 72000, status: 'active', assignedTo: { _id: 'e15', name: 'Pankit Shah', employeeId: 'EMP-015' }, location: 'Head Office' },
  { _id: 'as5', assetNumber: 'IT-005', name: 'Monitor Dell 24"', category: 'Monitor', type: 'it', cost: 18500, status: 'active', assignedTo: { _id: 'e12', name: 'Madhavi Desai', employeeId: 'EMP-012' }, location: 'Head Office' },
];

/** Insurance policies */
export const DEMO_INSURANCE = [
  { _id: 'in1', policyNumber: 'MED-001', type: 'medical', provider: 'Star Health', startDate: '2024-01-01', endDate: '2025-12-31', sumInsured: 500000, premium: 125000, status: 'active', employeeName: 'Group Policy - All Staff' },
  { _id: 'in2', policyNumber: 'GA-001', type: 'group-accident', provider: 'ICICI Lombard', startDate: '2024-04-01', endDate: '2025-03-31', sumInsured: 1000000, status: 'active', employeeName: 'Group Policy' },
  { _id: 'in3', policyNumber: 'OFF-001', type: 'fire-safety', provider: 'Bajaj Allianz', startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', officeLocation: 'Head Office - Ahmedabad' },
];

/** Performance reviews */
export const DEMO_PERFORMANCE = [
  { _id: 'pr1', employee: { _id: 'e6', name: 'Honey Chauhan', employeeId: 'EMP-006', designation: 'Program Officer' }, period: 'Q4 2024', reviewer: { name: 'Nilanjan Dey Chaudhury' }, selfAssessment: 'Completed', status: 'completed', rating: 4 },
  { _id: 'pr2', employee: { _id: 'e4', name: 'Himanshu Vaghela', employeeId: 'EMP-004', designation: 'Program Manager' }, period: 'Q4 2024', reviewer: { name: 'Nilanjan Dey Chaudhury' }, selfAssessment: 'Completed', status: 'completed', rating: 5 },
  { _id: 'pr3', employee: { _id: 'e13', name: 'Jalpa Adhiya', employeeId: 'EMP-013', designation: 'Sr. Accounts Officer' }, period: 'Q1 2025', reviewer: { name: 'Madhavi Desai' }, selfAssessment: 'pending', status: 'pending', rating: null },
  { _id: 'pr4', employee: { _id: 'e10', name: 'Krishti Kami', employeeId: 'EMP-010', designation: 'Project Officer' }, period: 'Q1 2025', reviewer: { name: 'Himanshu Vaghela' }, selfAssessment: 'pending', status: 'pending', rating: null },
];

/** Payroll runs */
export const DEMO_PAYROLL = [
  { _id: 'py1', month: 1, year: 2025, totalAmount: 1850000, payslipCount: 16, status: 'processed', processedAt: '2025-02-01' },
  { _id: 'py2', month: 12, year: 2024, totalAmount: 1820000, payslipCount: 16, status: 'processed', processedAt: '2025-01-01' },
  { _id: 'py3', month: 2, year: 2025, totalAmount: 0, payslipCount: 0, status: 'draft', processedAt: null },
];

/** Engagement surveys */
export const DEMO_ENGAGEMENT = [
  { _id: 'en1', name: 'Annual Engagement Survey 2024', type: 'Annual', launchDate: '2024-11-01', responses: 14, totalEmployees: 16, status: 'completed' },
  { _id: 'en2', name: 'Pulse Survey - Q1 2025', type: 'Pulse', launchDate: '2025-01-15', responses: 11, totalEmployees: 16, status: 'active' },
];

/** Letter templates */
export const DEMO_LETTER_TEMPLATES = [
  { _id: 'lt1', name: 'Offer Letter - Regular Employee', category: 'Recruitment', variables: '{{employeeName}}, {{employeeId}}, {{date}}', body: 'Dear {{employeeName}},\n\nWe are pleased to offer you the position at FWWB India.\nEmployee ID: {{employeeId}}\nDate: {{date}}\n\nPlease sign and return this letter.\n\nHR Team', usageCount: 8 },
  { _id: 'lt2', name: 'Appointment Letter', category: 'Recruitment', variables: '10 fields', body: 'Ref: {{letterId}}\n\nTo,\n{{employeeName}} ({{employeeId}})\n\nThis is to confirm your appointment. Letter type: {{letterType}}.\nGenerated by: {{generatedBy}}\nDate: {{date}}\n\nRegards,\nHR', usageCount: 12 },
  { _id: 'lt3', name: 'Experience Certificate', category: 'Exit', variables: '8 fields', body: 'EXPERIENCE CERTIFICATE\n\nThis is to certify that {{employeeName}} ({{employeeId}}) was employed with us.\nLetter ID: {{letterId}}\nType: {{letterType}}\nGenerated on: {{date}}\nBy: {{generatedBy}}\n\nAuthorized Signatory', usageCount: 5 },
  { _id: 'lt4', name: 'NOC - No Objection Certificate', category: 'General', variables: '6 fields', body: 'NO OBJECTION CERTIFICATE\n\nWe have no objection to the matter stated in request {{letterId}}.\nEmployee: {{employeeName}} ({{employeeId}})\nDate: {{date}}\n\nFWWB India', usageCount: 3 },
];

/** Generated letters – for employees */
export const DEMO_LETTER_INSTANCES = [
  { _id: 'li1', letterId: 'LTR-2024-089', template: { _id: 'lt2', name: 'Appointment Letter', category: 'Recruitment' }, employee: { _id: 'e10', name: 'Krishti Kami', employeeId: 'EMP-010' }, letterType: 'Appointment', status: 'sent', generatedBy: { name: 'Neha Kansara' } },
  { _id: 'li2', letterId: 'LTR-2024-090', template: { _id: 'lt3', name: 'Experience Certificate', category: 'Exit' }, employee: { _id: 'e8', name: 'Ramya Tambe', employeeId: 'EMP-008' }, letterType: 'Experience', status: 'sent', generatedBy: { name: 'Neha Kansara' } },
  { _id: 'li3', letterId: 'LTR-2025-001', template: { _id: 'lt4', name: 'NOC - No Objection Certificate', category: 'General' }, employee: { _id: 'e6', name: 'Honey Chauhan', employeeId: 'EMP-006' }, letterType: 'NOC', status: 'pending', generatedBy: { name: 'Madhavi Desai' } },
];

/** Partners / sub-grantees */
export const DEMO_PARTNERS = [
  { _id: 'pt1', name: 'Supraja Foundation', code: 'SUPRAJA', type: 'sub-grantee', location: 'Nagaland', contactEmail: 'info@suprajafoundation.org', status: 'active' },
  { _id: 'pt2', name: 'Gramin Mahila Vikas Samiti', code: 'GMVS', type: 'partner', location: 'Gujarat', contactEmail: 'contact@gmvs.org', status: 'active' },
  { _id: 'pt3', name: 'North East Livelihood Promotion Society', code: 'NELPS', type: 'implementing', location: 'Assam', status: 'active' },
];

/** Beneficiaries / impact counts by program */
export const DEMO_BENEFICIARIES = [
  { _id: 'ben1', project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' }, type: 'individual', category: 'Training - FE & BMS', count: 180, location: 'Nagaland', period: '2024-25 Q2', notes: 'Level 1 & 2 combined', recordedAt: '2024-11-30' },
  { _id: 'ben2', project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' }, type: 'individual', category: 'Skill Development', count: 45, location: 'Gujarat', period: '2024-25 Q2', recordedAt: '2024-11-30' },
  { _id: 'ben3', project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' }, type: 'SHG', count: 24, location: 'Nagaland', period: '2024-25', notes: 'SHGs linked to FPOs', recordedAt: '2024-12-01' },
  { _id: 'ben4', project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' }, type: 'FPO', count: 4, location: 'Nagaland, Manipur', period: '2024-25', recordedAt: '2024-12-01' },
  { _id: 'ben5', project: { _id: 'demo-program-2', name: 'North East Livelihood Promotion' }, type: 'individual', count: 120, location: 'Assam', period: '2024-25 Q2', recordedAt: '2024-11-15' },
];

/** LFA – Logical Framework per project (demo) */
export const DEMO_LFA: { project: string; goal: string; objectives: { title: string; indicators?: string; outcomes?: { title: string; indicators?: string; outputs?: { title: string; indicators?: string; activities?: { title: string; indicators?: string }[] }[] }[] }[] } = {
  project: 'demo-supraja-project',
  goal: 'Transformation of agriculture through gender inclusive climate resilient systems',
  objectives: [
    { title: 'Objective 1: Gender inclusive FPO ecosystem development', indicators: 'Number of FPOs formed', outcomes: [] },
    { title: 'Objective 2: Self-reliant FPOs through business development', indicators: 'Business plans developed', outcomes: [] },
    { title: "Objective 3: Women's access to financial resources", indicators: 'Women linked to formal finance', outcomes: [] },
    { title: "Objective 4: Women's access to climate resilient technologies", indicators: 'Adoption rate', outcomes: [] },
    { title: 'Objective 5: Setting up Enterprises', indicators: 'Enterprises established', outcomes: [] },
  ],
};

/** Reports – generated reports */
export const DEMO_REPORTS = [
  { _id: 'rp1', name: 'Q4 2024 Summary Report', type: 'Summary', project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' }, periodStart: '2024-10-01', periodEnd: '2024-12-31', dueDate: '2025-01-31', format: 'pdf', generatedBy: { name: 'Program Team' }, createdAt: '2025-01-15' },
  { _id: 'rp2', name: 'Budget Utilization FY24-25', type: 'Budget', project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' }, periodStart: '2024-04-01', periodEnd: '2025-03-31', dueDate: '2025-04-15', format: 'excel', generatedBy: { name: 'Finance Team' }, createdAt: '2025-01-20' },
  { _id: 'rp3', name: 'Donor Quarterly Report Q4', type: 'Donor', project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' }, periodStart: '2024-10-01', periodEnd: '2024-12-31', dueDate: '2025-01-31', format: 'pdf', generatedBy: { name: 'Nilanjan Dey Chaudhury' }, createdAt: '2024-12-05' },
];

/** Data collection forms – for program teams to collect field data via mobile */
export const DEMO_FORMS = [
  {
    _id: 'form1',
    title: 'Beneficiary Survey',
    description: 'Post-training beneficiary feedback. Fill during field visits.',
    status: 'active',
    createdBy: { name: 'Program Team' },
    project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' },
    fields: [
      { key: 'beneficiary_name', label: 'Beneficiary name', type: 'text', required: true },
      { key: 'village', label: 'Village / location', type: 'text', required: true },
      { key: 'training_attended', label: 'Training attended', type: 'text', required: true },
      { key: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
      { key: 'comments', label: 'Comments', type: 'textarea', required: false },
    ],
  },
  {
    _id: 'form2',
    title: 'Field Visit Report',
    description: 'Daily field visit summary for program management.',
    status: 'active',
    createdBy: { name: 'Program Team' },
    project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' },
    fields: [
      { key: 'visit_date', label: 'Visit date', type: 'date', required: true },
      { key: 'location', label: 'Location', type: 'text', required: true },
      { key: 'purpose', label: 'Purpose of visit', type: 'text', required: true },
      { key: 'participants_met', label: 'Number of participants met', type: 'number', required: false },
      { key: 'observations', label: 'Key observations', type: 'textarea', required: true },
      { key: 'follow_up', label: 'Follow-up required', type: 'text', required: false },
    ],
  },
  {
    _id: 'form3',
    title: 'FPO Meeting Notes',
    description: 'Notes from FPO / farmer producer organisation meetings.',
    status: 'active',
    createdBy: { name: 'Program Team' },
    project: { _id: 'demo-supraja-project', name: 'Supraja Foundation - FPO Development' },
    fields: [
      { key: 'fpo_name', label: 'FPO name', type: 'text', required: true },
      { key: 'meeting_date', label: 'Meeting date', type: 'date', required: true },
      { key: 'attendees', label: 'Number of attendees', type: 'number', required: false },
      { key: 'agenda', label: 'Agenda / topics', type: 'textarea', required: true },
      { key: 'decisions', label: 'Decisions / action items', type: 'textarea', required: false },
    ],
  },
];

/** Sample form submissions – field data fed from mobile, used for program mgmt on web */
export const DEMO_FORM_SUBMISSIONS: Record<string, { _id: string; form: string; submittedBy: { name: string }; data: Record<string, unknown>; createdAt: string }[]> = {
  form1: [
    { _id: 'sub1a', form: 'form1', submittedBy: { name: 'Honey Chauhan' }, createdAt: '2025-02-08T10:30:00.000Z', data: { beneficiary_name: 'Ramesh K.', village: 'Phesama', training_attended: 'FE & BMS Level 1', rating: 5, comments: 'Very useful for our SHG.' } },
    { _id: 'sub1b', form: 'form1', submittedBy: { name: 'Krishti Kami' }, createdAt: '2025-02-07T14:00:00.000Z', data: { beneficiary_name: 'Lima A.', village: 'Jakhama', training_attended: 'Business plans', rating: 4, comments: 'Good session.' } },
    { _id: 'sub1c', form: 'form1', submittedBy: { name: 'Honey Chauhan' }, createdAt: '2025-02-10T09:00:00.000Z', data: { beneficiary_name: 'Neizo K.', village: 'Phesama', training_attended: 'FE & BMS Level 2', rating: 5, comments: 'Helped with record-keeping.' } },
    { _id: 'sub1d', form: 'form1', submittedBy: { name: 'Ramya Tambe' }, createdAt: '2025-02-11T11:00:00.000Z', data: { beneficiary_name: 'Viktor S.', village: 'Jakhama', training_attended: 'Skill Development', rating: 4, comments: '' } },
    { _id: 'sub1e', form: 'form1', submittedBy: { name: 'Kurshid Alam' }, createdAt: '2025-02-12T15:30:00.000Z', data: { beneficiary_name: 'Merenla', village: 'Kohima', training_attended: 'Business plans', rating: 5, comments: 'Requested follow-up training.' } },
    { _id: 'sub1f', form: 'form1', submittedBy: { name: 'Honey Chauhan' }, createdAt: '2025-02-14T10:00:00.000Z', data: { beneficiary_name: 'Rovi S.', village: 'Phesama', training_attended: 'FE & BMS Level 1', rating: 4, comments: 'Good.' } },
  ],
  form2: [
    { _id: 'sub2a', form: 'form2', submittedBy: { name: 'Himanshu Vaghela' }, createdAt: '2025-02-08T18:00:00.000Z', data: { visit_date: '2025-02-08', location: 'Kohima', purpose: 'Partner review', participants_met: 12, observations: 'FPO members engaged. Need follow-up on bookkeeping.', follow_up: 'Schedule bookkeeping training.' } },
    { _id: 'sub2b', form: 'form2', submittedBy: { name: 'Honey Chauhan' }, createdAt: '2025-02-09T17:00:00.000Z', data: { visit_date: '2025-02-09', location: 'Phesama', purpose: 'Beneficiary follow-up', participants_met: 8, observations: 'SHG meeting. Collected survey forms.', follow_up: 'Submit survey data.' } },
    { _id: 'sub2c', form: 'form2', submittedBy: { name: 'Nilanjan Dey Chaudhury' }, createdAt: '2025-02-10T16:00:00.000Z', data: { visit_date: '2025-02-10', location: 'Imphal', purpose: 'ToT coordination', participants_met: 15, observations: 'Venue finalised. Materials ready.', follow_up: 'Send invites.' } },
    { _id: 'sub2d', form: 'form2', submittedBy: { name: 'Krishti Kami' }, createdAt: '2025-02-11T14:00:00.000Z', data: { visit_date: '2025-02-11', location: 'Jakhama', purpose: 'Field data collection', participants_met: 6, observations: 'Farm visits. Crop diversity good.', follow_up: 'Link with market.' } },
    { _id: 'sub2e', form: 'form2', submittedBy: { name: 'Himanshu Vaghela' }, createdAt: '2025-02-13T12:00:00.000Z', data: { visit_date: '2025-02-13', location: 'Ahmedabad', purpose: 'Partner NGOs meet prep', participants_met: 4, observations: 'Agenda and logistics discussed.', follow_up: 'Confirm dates.' } },
  ],
  form3: [
    { _id: 'sub3a', form: 'form3', submittedBy: { name: 'Nilanjan Dey Chaudhury' }, createdAt: '2025-02-05T16:00:00.000Z', data: { fpo_name: 'Phesama FPO', meeting_date: '2025-02-05', attendees: 8, agenda: 'Quarterly progress, market linkage', decisions: 'Next market visit in March.' } },
    { _id: 'sub3b', form: 'form3', submittedBy: { name: 'Honey Chauhan' }, createdAt: '2025-02-06T10:00:00.000Z', data: { fpo_name: 'Jakhama FPO', meeting_date: '2025-02-06', attendees: 6, agenda: 'Bookkeeping, savings', decisions: 'Training in March.' } },
    { _id: 'sub3c', form: 'form3', submittedBy: { name: 'Ramya Tambe' }, createdAt: '2025-02-07T14:00:00.000Z', data: { fpo_name: 'Phesama FPO', meeting_date: '2025-02-07', attendees: 10, agenda: 'Elections, roles', decisions: 'New committee from April.' } },
    { _id: 'sub3d', form: 'form3', submittedBy: { name: 'Nilanjan Dey Chaudhury' }, createdAt: '2025-02-12T11:00:00.000Z', data: { fpo_name: 'Kohima FPO', meeting_date: '2025-02-12', attendees: 12, agenda: 'Market linkage, pricing', decisions: 'Trial sale next week.' } },
    { _id: 'sub3e', form: 'form3', submittedBy: { name: 'Kurshid Alam' }, createdAt: '2025-02-14T09:00:00.000Z', data: { fpo_name: 'Phesama FPO', meeting_date: '2025-02-14', attendees: 7, agenda: 'Compliance, audit', decisions: 'Documents by month-end.' } },
  ],
};

/** Demo file attachments (when DB not connected) */
export const DEMO_FILES = [
  { _id: 'demo-file-1', originalName: 'Supraja_Report_Q4.pdf', mimeType: 'application/pdf', size: 125000, refModel: 'Project', refId: 'demo-supraja-project', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'demo-file-2', originalName: 'Budget_Summary.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 18000, refModel: 'Project', refId: 'demo-supraja-project', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export const dashboardStats = {
  activityCount: SUPRAJA_ACTIVITIES.length,
  projectCount: 1,
  expenseCount: SUPRAJA_ACTIVITIES.reduce((s, a) => s + (a.expenses || 0), 0),
  employeeCount: FWWB_TEAM.length,
  pendingLeave: 1,
  totalAllocated: SUPRAJA_BUDGET.reduce((s, b) => s + b.allocated, 0),
  totalSpent: SUPRAJA_BUDGET.reduce((s, b) => s + b.spent, 0),
};
