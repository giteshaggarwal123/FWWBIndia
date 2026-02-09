import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Activity } from '../models/Activity.js';
import { Budget } from '../models/Budget.js';
import { Employee } from '../models/Employee.js';
import { Expense } from '../models/Expense.js';
import { JobPosting } from '../models/JobPosting.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Attendance } from '../models/Attendance.js';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { LetterTemplate, LetterInstance } from '../models/LetterTemplate.js';
import { TravelRequest } from '../models/TravelRequest.js';
import { StationeryRequest } from '../models/StationeryRequest.js';
import { AdminExpense } from '../models/AdminExpense.js';
import { Asset } from '../models/Asset.js';
import { InsurancePolicy } from '../models/InsurancePolicy.js';
import { EngagementSurvey } from '../models/Engagement.js';
import { Partner } from '../models/Partner.js';
import { MonitoringEntry } from '../models/MonitoringEntry.js';
import { PerformanceReview } from '../models/PerformanceReview.js';
import { PayrollRun } from '../models/PayrollRun.js';
import { Report } from '../models/Report.js';
import { LFA } from '../models/LFA.js';
import { Form } from '../models/Form.js';
import { FormSubmission } from '../models/FormSubmission.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fwwb';
const FORCE = process.argv.includes('--force');

const demoUsers = [
  { username: 'admin', password: 'demo123', name: 'Admin User', role: 'Management', type: 'management' as const },
  { username: 'program.user', password: 'demo123', name: 'Program User', role: 'Program Team', type: 'program' as const },
  { username: 'hr.user', password: 'demo123', name: 'HR User', role: 'HR Team', type: 'hr' as const },
  { username: 'admin.user', password: 'demo123', name: 'Admin Team User', role: 'Admin Team', type: 'admin' as const },
  { username: 'employee', password: 'demo123', name: 'Employee User', role: 'Employee', type: 'employee' as const },
  { username: 'donor', password: 'demo123', name: 'Donor / Funder', role: 'Donor', type: 'donor' as const },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  if (FORCE) {
    console.log('--force: Dropping existing collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const c of collections) {
      await mongoose.connection.db.dropCollection(c.name);
      console.log('  Dropped', c.name);
    }
  }

  // Users
  for (const u of demoUsers) {
    const existing = await User.findOne({ username: u.username });
    if (!existing) {
      await User.create(u);
      console.log('Created user:', u.username);
    }
  }
  const adminUser = await User.findOne({ username: 'admin' });
  const hrUser = await User.findOne({ username: 'hr.user' });

  // Partners
  let partnerSupraja = await Partner.findOne({ code: 'SUPRAJA' });
  if (!partnerSupraja) {
    partnerSupraja = await Partner.create({ name: 'Supraja Foundation', code: 'SUPRAJA', type: 'sub-grantee', location: 'Nagaland', contactEmail: 'info@suprajafoundation.org', status: 'active' });
    console.log('Created partner: Supraja Foundation');
  }
  if ((await Partner.countDocuments()) < 3) {
    await Partner.insertMany([
      { name: 'Gramin Mahila Vikas Samiti', code: 'GMVS', type: 'partner', location: 'Gujarat', contactEmail: 'contact@gmvs.org', status: 'active' },
      { name: 'North East Livelihood Promotion Society', code: 'NELPS', type: 'implementing', location: 'Assam', status: 'active' },
    ]);
  }

  // Project - Supraja Foundation
  let project = await Project.findOne({ code: 'SUPRAJA' });
  if (!project) {
    project = await Project.create({
      name: 'Supraja Foundation - FPO Development',
      code: 'SUPRAJA',
      status: 'active',
      donor: 'FWWB / Donor',
      partner: partnerSupraja._id,
    });
    console.log('Created project: Supraja Foundation - FPO Development');
  }

  // Employees - FWWB Team (16 members)
  const empData = [
    { employeeId: 'EMP-001', name: 'S.S.Bhat', email: 's.bhat@fwwbindia.org', department: 'Management', designation: 'Chief Executive Officer', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-002', name: 'Neha Kansara', email: 'neha.kansara@fwwbindia.org', department: 'Management', designation: 'Chief Operating Officer', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-003', name: 'Nilanjan Dey Chaudhury', email: 'nilanjan.chaudhury@fwwbindia.org', department: 'Programs', designation: 'Program Head', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-004', name: 'Himanshu Vaghela', email: 'himanshu.vaghela@fwwbindia.org', department: 'Programs', designation: 'Program Manager', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-005', name: 'Alexis Muthiah', email: 'alexis.muthiah@fwwbindia.org', department: 'Programs', designation: 'Program Manager', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-006', name: 'Honey Chauhan', email: 'honey.chauhan@fwwbindia.org', department: 'Programs', designation: 'Program Officer', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-007', name: 'Kurshid Alam', email: 'kurshid.alam@fwwbindia.org', department: 'Programs', designation: 'Program Officer', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-008', name: 'Ramya Tambe', email: 'ramya.tambe@fwwbindia.org', department: 'Programs', designation: 'Program Associate', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-009', name: 'Alito Awomi', email: 'alito.awomi@fwwbindia.org', department: 'Programs', designation: 'Program Associate', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-010', name: 'Krishti Kami', email: 'krishti.kami@fwwbindia.org', department: 'Programs', designation: 'Project Officer', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-011', name: 'Kuldip Dixit', email: 'kuldip.dixit@fwwbindia.org', department: 'Programs', designation: 'Project Officer', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-012', name: 'Madhavi Desai', email: 'madhavi.desai@fwwbindia.org', department: 'Finance', designation: 'Finance Head', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-013', name: 'Jalpa Adhiya', email: 'jalpa.adhiya@fwwbindia.org', department: 'Finance', designation: 'Sr. Accounts Officer', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-014', name: 'Krishna Bhavsar', email: 'krishna.bhavsar@fwwbindia.org', department: 'Finance', designation: 'Accounts & Finance', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-015', name: 'Pankit Shah', email: 'pankit.shah@fwwbindia.org', department: 'IT', designation: 'IT - Program Officer', location: 'Head Office - Ahmedabad', status: 'active' },
    { employeeId: 'EMP-016', name: 'Geetaben Parmar', email: 'geetaben.parmar@fwwbindia.org', department: 'Administration', designation: 'Support Staff', location: 'Head Office - Ahmedabad', status: 'active' },
  ];
  const empMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const e of empData) {
    let emp = await Employee.findOne({ employeeId: e.employeeId });
    if (!emp) {
      emp = await Employee.create(e);
      console.log('Created employee:', e.name);
    }
    empMap[e.employeeId] = emp._id;
  }
  // Link demo "employee" user to an employee record so mobile "My Attendance" / "My Leave" work
  const employeeUser = await User.findOne({ username: 'employee' });
  if (employeeUser) {
    await Employee.findOneAndUpdate({ employeeId: 'EMP-006' }, { userId: employeeUser._id });
    console.log('Linked employee user to EMP-006');
  }

  // Activities - Supraja 7 activities
  if ((await Activity.countDocuments({ project: project._id })) === 0) {
    const activities = [
      { activityId: 'SUPRAJA-2024-001', name: 'Training on FE & BMS - Level 1', budget: 11250, quarter: 'Oct - Dec 2022', location: 'Phesama - Nagaland', expectedParticipants: 25, actualParticipants: 66, achievementRate: 264, budgetHead: 'Direct Cost - Training', status: 'completed' as const },
      { activityId: 'SUPRAJA-2024-002', name: 'Training on FE & BMS - Level 2', budget: 7500, quarter: 'Oct - Dec 2022', location: 'Phesama - Nagaland', expectedParticipants: 25, actualParticipants: 44, achievementRate: 176, budgetHead: 'Direct Cost - Training', status: 'completed' as const },
      { activityId: 'SUPRAJA-2024-003', name: 'Training on Skill Development', budget: 45000, quarter: 'Oct - Dec 2022', location: 'Ahmedabad - Gujarat', expectedParticipants: 25, actualParticipants: 45, achievementRate: 180, budgetHead: 'Direct Cost - Training', status: 'completed' as const },
      { activityId: 'SUPRAJA-2024-004', name: 'Training on developing business plans', budget: 11250, quarter: 'Oct - Dec 2022', location: 'Jakhama - Nagaland', expectedParticipants: 25, actualParticipants: 30, achievementRate: 120, budgetHead: 'Support to 360 beneficiaries', status: 'completed' as const },
      { activityId: 'SUPRAJA-2024-005', name: 'Partner NGOs Meet', budget: 450000, quarter: 'Oct - Dec 2022', location: 'Ahmedabad - Gujarat', expectedParticipants: 40, actualParticipants: 50, budgetHead: 'Partner NGOs Meet', status: 'completed' as const },
      { activityId: 'SUPRAJA-2024-006', name: 'Training of Trainers', budget: 450000, quarter: 'Oct - Dec 2022', location: 'Imphal - Manipur', expectedParticipants: 40, actualParticipants: 50, budgetHead: 'Training of Trainers', status: 'completed' as const },
      { activityId: 'SUPRAJA-2024-007', name: 'Workbook Printing', budget: 750000, quarter: 'Oct - Dec 2022', location: 'Ahmedabad - Gujarat', expectedParticipants: 3000, actualParticipants: 3000, budgetHead: 'Workbook/training material cost', status: 'completed' as const },
    ];
    const createdActs = await Activity.insertMany(activities.map((a) => ({ ...a, project: project!._id })));
    console.log('Created', createdActs.length, 'activities');
  }

  const activities = await Activity.find({ project: project._id }).lean();
  const actMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const a of activities) {
    actMap[a.activityId] = a._id;
  }

  // Budget
  if ((await Budget.countDocuments({ project: project._id })) === 0) {
    await Budget.insertMany([
      { project: project._id, head: 'Head A: Direct Cost - Training of Mass Beneficiaries', allocated: 63750, utilized: 66500, financialYear: '2024-25' },
      { project: project._id, head: 'Head A: Direct Cost - Support to 360 beneficiaries', allocated: 11250, utilized: 4500, financialYear: '2024-25' },
      { project: project._id, head: 'Head A: Direct Cost - Partner NGOs Meet', allocated: 450000, utilized: 585000, financialYear: '2024-25' },
      { project: project._id, head: 'Head A: Direct Cost - Training of Trainers', allocated: 450000, utilized: 585000, financialYear: '2024-25' },
      { project: project._id, head: 'Head A: Direct Cost - Workbook/training material cost', allocated: 750000, utilized: 750000, financialYear: '2024-25' },
    ]);
    console.log('Created budget heads');
  }

  // Expenses (from activities with expenses)
  if ((await Expense.countDocuments()) === 0 && adminUser) {
    const expData = [
      { activityId: 'SUPRAJA-2024-001', amount: 9900, category: 'Direct Cost - Training', description: 'Training on FE & BMS - Level 1' },
      { activityId: 'SUPRAJA-2024-002', amount: 6600, category: 'Direct Cost - Training', description: 'Training on FE & BMS - Level 2' },
      { activityId: 'SUPRAJA-2024-003', amount: 54000, category: 'Direct Cost - Training', description: 'Training on Skill Development' },
      { activityId: 'SUPRAJA-2024-004', amount: 4500, category: 'Support to 360 beneficiaries', description: 'Training on developing business plans' },
      { activityId: 'SUPRAJA-2024-005', amount: 585000, category: 'Partner NGOs Meet', description: 'Partner NGOs Meet' },
      { activityId: 'SUPRAJA-2024-006', amount: 585000, category: 'Training of Trainers', description: 'Training of Trainers' },
      { activityId: 'SUPRAJA-2024-007', amount: 750000, category: 'Workbook/training material cost', description: 'Workbook Printing' },
    ];
    for (const e of expData) {
      const actId = actMap[e.activityId];
      if (actId) {
        await Expense.create({
          expenseId: `EXP-${e.activityId}`,
          project: project._id,
          activity: actId,
          amount: e.amount,
          category: e.category,
          description: e.description,
          date: new Date('2024-11-30'),
          submittedBy: adminUser._id,
          status: 'settled',
        });
      }
    }
    console.log('Created expenses');
  }

  // Monitoring
  if ((await MonitoringEntry.countDocuments()) === 0 && adminUser && activities.length > 0) {
    for (let i = 0; i < Math.min(5, activities.length); i++) {
      const a = activities[i];
      await MonitoringEntry.create({
        entryId: `MON-${a.activityId}`,
        project: project._id,
        activity: a._id,
        location: a.location,
        date: new Date('2024-11-30'),
        notes: `Field visit completed. ${a.actualParticipants ?? 0} participants attended.`,
        expectedParticipants: a.expectedParticipants,
        actualParticipants: a.actualParticipants,
        collectedBy: adminUser._id,
      });
    }
    console.log('Created monitoring entries');
  }

  // LFA
  const lfaExists = await LFA.findOne({ project: project._id });
  if (!lfaExists) {
    await LFA.create({
      project: project._id,
      goal: 'Transformation of agriculture through gender inclusive climate resilient systems',
      objectives: [
        { title: 'Objective 1 : Gender inclusive FPO ecosystem development', indicators: '', outcomes: [] },
        { title: 'Objective 2 : Self-reliant FPOs through business development', indicators: '', outcomes: [] },
        { title: "Objective 3 : Women's access to financial resources", indicators: '', outcomes: [] },
        { title: "Objective 4: Women's access to climate resilient technologies", indicators: '', outcomes: [] },
        { title: 'Objective 5: Setting up Enterprises', indicators: '', outcomes: [] },
      ],
    });
    console.log('Created LFA');
  }

  // Data collection forms (for program teams; mobile feeds field data)
  if ((await Form.countDocuments()) === 0 && adminUser && project) {
    const form1 = await Form.create({
      title: 'Beneficiary Survey',
      description: 'Post-training beneficiary feedback. Fill during field visits.',
      status: 'active',
      createdBy: adminUser._id,
      project: project._id,
      fields: [
        { key: 'beneficiary_name', label: 'Beneficiary name', type: 'text', required: true },
        { key: 'village', label: 'Village / location', type: 'text', required: true },
        { key: 'training_attended', label: 'Training attended', type: 'text', required: true },
        { key: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
        { key: 'comments', label: 'Comments', type: 'textarea', required: false },
      ],
    });
    const form2 = await Form.create({
      title: 'Field Visit Report',
      description: 'Daily field visit summary for program management.',
      status: 'active',
      createdBy: adminUser._id,
      project: project._id,
      fields: [
        { key: 'visit_date', label: 'Visit date', type: 'date', required: true },
        { key: 'location', label: 'Location', type: 'text', required: true },
        { key: 'purpose', label: 'Purpose of visit', type: 'text', required: true },
        { key: 'participants_met', label: 'Number of participants met', type: 'number', required: false },
        { key: 'observations', label: 'Key observations', type: 'textarea', required: true },
        { key: 'follow_up', label: 'Follow-up required', type: 'text', required: false },
      ],
    });
    await Form.create({
      title: 'FPO Meeting Notes',
      description: 'Notes from FPO / farmer producer organisation meetings.',
      status: 'active',
      createdBy: adminUser._id,
      project: project._id,
      fields: [
        { key: 'fpo_name', label: 'FPO name', type: 'text', required: true },
        { key: 'meeting_date', label: 'Meeting date', type: 'date', required: true },
        { key: 'attendees', label: 'Number of attendees', type: 'number', required: false },
        { key: 'agenda', label: 'Agenda / topics', type: 'textarea', required: true },
        { key: 'decisions', label: 'Decisions / action items', type: 'textarea', required: false },
      ],
    });
    await FormSubmission.insertMany([
      { form: form1._id, submittedBy: adminUser._id, data: { beneficiary_name: 'Ramesh K.', village: 'Phesama', training_attended: 'FE & BMS Level 1', rating: 5, comments: 'Very useful for our SHG.' } },
      { form: form1._id, submittedBy: adminUser._id, data: { beneficiary_name: 'Lima A.', village: 'Jakhama', training_attended: 'Business plans', rating: 4, comments: 'Good session.' } },
      { form: form2._id, submittedBy: adminUser._id, data: { visit_date: '2025-02-08', location: 'Kohima', purpose: 'Partner review', participants_met: 12, observations: 'FPO members engaged. Need follow-up on bookkeeping.', follow_up: 'Schedule bookkeeping training.' } },
    ]);
    console.log('Created forms and sample submissions');
  }

  // Leave
  if ((await LeaveRequest.countDocuments()) === 0) {
    await LeaveRequest.insertMany([
      { employee: empMap['EMP-006'], leaveType: 'Casual Leave', fromDate: new Date('2025-01-10'), toDate: new Date('2025-01-12'), days: 3, reason: 'Personal work', status: 'pending' },
      { employee: empMap['EMP-010'], leaveType: 'Sick Leave', fromDate: new Date('2024-12-20'), toDate: new Date('2024-12-21'), days: 2, reason: 'Health', status: 'approved', approvedBy: adminUser!._id },
      { employee: empMap['EMP-004'], leaveType: 'Earned Leave', fromDate: new Date('2025-02-01'), toDate: new Date('2025-02-05'), days: 5, reason: 'Family trip', status: 'pending' },
    ]);
    console.log('Created leave requests');
  }

  // Travel
  if ((await TravelRequest.countDocuments()) === 0) {
    await TravelRequest.insertMany([
      { requestId: 'TR-2025-001', employee: empMap['EMP-004'], purposeOfTravel: 'Partner NGOs review - Nagaland', from: 'Ahmedabad', to: 'Kohima', travelDate: new Date('2025-02-15'), mode: 'flight', estimatedCost: 18500, status: 'approved' },
      { requestId: 'TR-2025-002', employee: empMap['EMP-010'], purposeOfTravel: 'Field visit - Imphal', from: 'Ahmedabad', to: 'Imphal', travelDate: new Date('2025-02-20'), mode: 'flight', estimatedCost: 22000, status: 'pending' },
      { requestId: 'TR-2024-090', employee: empMap['EMP-003'], purposeOfTravel: 'Donor meeting', from: 'Ahmedabad', to: 'Delhi', travelDate: new Date('2024-12-10'), mode: 'flight', estimatedCost: 15000, status: 'completed' },
    ]);
    console.log('Created travel requests');
  }

  // Stationery
  if ((await StationeryRequest.countDocuments()) === 0 && adminUser) {
    await StationeryRequest.insertMany([
      { requestId: 'ST-2025-001', requestedBy: adminUser._id, department: 'Programs', purpose: 'training', items: 'A4 Paper, Markers, Flip charts', quantity: '5 reams, 20, 3', dateNeeded: new Date('2025-02-15'), date: new Date('2025-02-05'), status: 'pending' },
      { requestId: 'ST-2024-156', requestedBy: adminUser._id, department: 'Programs', purpose: 'workshop', items: 'Notebooks, Pens', quantity: '50, 100', dateNeeded: new Date('2024-11-20'), date: new Date('2024-11-10'), status: 'fulfilled' },
      { requestId: 'ST-2025-002', requestedBy: adminUser._id, department: 'Administration', purpose: 'general', items: 'Print cartridges, Stationery', quantity: '2, 1 set', dateNeeded: new Date('2025-02-10'), date: new Date('2025-02-03'), status: 'approved' },
    ]);
    console.log('Created stationery requests');
  }

  // Admin Expenses
  if ((await AdminExpense.countDocuments()) === 0) {
    await AdminExpense.insertMany([
      { expenseId: 'AEXP-2024-089', date: new Date('2024-12-15'), category: 'Office Rent', description: 'December Rent - HO', amount: 85000, submittedBy: 'Admin Team', status: 'approved' },
      { expenseId: 'AEXP-2024-090', date: new Date('2024-12-20'), category: 'Utilities', description: 'Electricity Bill - December', amount: 18500, submittedBy: 'Admin Team', status: 'pending' },
      { expenseId: 'AEXP-2025-001', date: new Date('2025-01-05'), category: 'Office Supplies', description: 'Stationery - January', amount: 12500, submittedBy: 'Admin Team', status: 'pending' },
    ]);
    console.log('Created admin expenses');
  }

  // Assets
  if ((await Asset.countDocuments()) === 0) {
    await Asset.insertMany([
      { assetNumber: 'IT-001', name: 'Dell Laptop', category: 'Laptop', type: 'it', cost: 65000, status: 'active', assignedTo: empMap['EMP-004'], location: 'Head Office' },
      { assetNumber: 'IT-002', name: 'HP Printer', category: 'Printer', type: 'it', status: 'active', location: 'Finance - HO' },
      { assetNumber: 'IT-003', name: 'MacBook Pro', category: 'Laptop', type: 'it', cost: 125000, status: 'active', assignedTo: empMap['EMP-003'], location: 'Head Office' },
      { assetNumber: 'IT-004', name: 'Lenovo ThinkPad', category: 'Laptop', type: 'it', cost: 72000, status: 'active', assignedTo: empMap['EMP-015'], location: 'Head Office' },
      { assetNumber: 'IT-005', name: 'Monitor Dell 24"', category: 'Monitor', type: 'it', cost: 18500, status: 'active', assignedTo: empMap['EMP-012'], location: 'Head Office' },
    ]);
    console.log('Created assets');
  }

  // Insurance
  if ((await InsurancePolicy.countDocuments()) === 0) {
    await InsurancePolicy.insertMany([
      { policyNumber: 'MED-001', type: 'medical', provider: 'Star Health', startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), sumInsured: 500000, premium: 125000, status: 'active' },
      { policyNumber: 'GA-001', type: 'group-accident', provider: 'ICICI Lombard', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), sumInsured: 1000000, status: 'active' },
      { policyNumber: 'OFF-001', type: 'fire-safety', provider: 'Bajaj Allianz', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), status: 'active' },
    ]);
    console.log('Created insurance policies');
  }

  // Recruitment
  if ((await JobPosting.countDocuments()) === 0) {
    await JobPosting.insertMany([
      { title: 'Program Manager', department: 'Programs', location: 'Ahmedabad', postedOn: new Date('2024-12-01'), applications: 35, status: 'active' },
      { title: 'Finance Officer', department: 'Finance', location: 'Ahmedabad', postedOn: new Date('2024-12-05'), applications: 12, status: 'active' },
      { title: 'Field Officer - Nagaland', department: 'Programs', location: 'Nagaland', postedOn: new Date('2025-01-10'), applications: 8, status: 'active' },
    ]);
    console.log('Created job postings');
  }

  // Attendance
  if ((await Attendance.countDocuments()) === 0) {
    await Attendance.insertMany([
      { employee: empMap['EMP-001'], date: new Date('2025-02-07'), checkIn: new Date('2025-02-07T09:00:00'), checkOut: new Date('2025-02-07T18:00:00'), status: 'present', notes: '' },
      { employee: empMap['EMP-006'], date: new Date('2025-02-07'), checkIn: new Date('2025-02-07T09:15:00'), checkOut: new Date('2025-02-07T17:45:00'), status: 'present', notes: '' },
      { employee: empMap['EMP-004'], date: new Date('2025-02-07'), status: 'wfh', notes: 'Work from home - field planning' },
      { employee: empMap['EMP-012'], date: new Date('2025-02-06'), checkIn: new Date('2025-02-06T09:30:00'), checkOut: new Date('2025-02-06T18:30:00'), status: 'present', notes: '' },
      { employee: empMap['EMP-015'], date: new Date('2025-02-06'), checkIn: new Date('2025-02-06T10:00:00'), checkOut: new Date('2025-02-06T18:00:00'), status: 'present', notes: '' },
    ]);
    console.log('Created attendance records');
  }

  // Calendar
  if ((await CalendarEvent.countDocuments()) === 0) {
    await CalendarEvent.insertMany([
      { title: 'Year End Celebration', type: 'event', date: new Date('2024-12-31'), location: 'HO - Conference Hall', participants: 'All Staff', status: 'confirmed' },
      { title: 'Republic Day', type: 'holiday', date: new Date('2025-01-26'), status: 'confirmed' },
      { title: 'Quarterly Program Review', type: 'event', date: new Date('2025-02-15'), location: 'Head Office', participants: 'Program Team', status: 'confirmed' },
      { title: 'Board Meeting', type: 'event', date: new Date('2025-02-28'), location: 'Conference Room', participants: 'Management', status: 'planned' },
      { title: 'Holi', type: 'holiday', date: new Date('2025-03-14'), status: 'confirmed' },
    ]);
    console.log('Created calendar events');
  }

  // Letter Templates
  let lt1: mongoose.Types.ObjectId | null = null;
  let lt2: mongoose.Types.ObjectId | null = null;
  let lt3: mongoose.Types.ObjectId | null = null;
  let lt4: mongoose.Types.ObjectId | null = null;
  if ((await LetterTemplate.countDocuments()) === 0) {
    const tpls = await LetterTemplate.insertMany([
      { name: 'Offer Letter - Regular Employee', category: 'Recruitment', variables: '12 fields', body: '', usageCount: 8 },
      { name: 'Appointment Letter', category: 'Recruitment', variables: '10 fields', body: '', usageCount: 12 },
      { name: 'Experience Certificate', category: 'Exit', variables: '8 fields', body: '', usageCount: 5 },
      { name: 'NOC - No Objection Certificate', category: 'General', variables: '6 fields', body: '', usageCount: 3 },
    ]);
    lt1 = tpls[0]._id; lt2 = tpls[1]._id; lt3 = tpls[2]._id; lt4 = tpls[3]._id;
    console.log('Created letter templates');
  } else {
    const t = await LetterTemplate.find().limit(4).lean();
    lt1 = t[0]?._id ?? null; lt2 = t[1]?._id ?? null; lt3 = t[2]?._id ?? null; lt4 = t[3]?._id ?? null;
  }

  // Letter Instances
  if ((await LetterInstance.countDocuments()) === 0 && lt2 && lt3 && lt4 && adminUser && hrUser) {
    await LetterInstance.insertMany([
      { letterId: 'LTR-2024-089', template: lt2, employee: empMap['EMP-010'], letterType: 'Appointment', status: 'sent', generatedBy: hrUser._id },
      { letterId: 'LTR-2024-090', template: lt3, employee: empMap['EMP-008'], letterType: 'Experience', status: 'sent', generatedBy: hrUser._id },
      { letterId: 'LTR-2025-001', template: lt4, employee: empMap['EMP-006'], letterType: 'NOC', status: 'pending', generatedBy: adminUser._id },
    ]);
    console.log('Created letter instances');
  }

  // Performance
  if ((await PerformanceReview.countDocuments()) === 0 && hrUser) {
    await PerformanceReview.insertMany([
      { employee: empMap['EMP-006'], period: 'Q4 2024', reviewer: adminUser!._id, selfAssessment: 'Completed', status: 'completed', rating: 4 },
      { employee: empMap['EMP-004'], period: 'Q4 2024', reviewer: adminUser!._id, selfAssessment: 'Completed', status: 'completed', rating: 5 },
      { employee: empMap['EMP-013'], period: 'Q1 2025', reviewer: adminUser!._id, selfAssessment: 'pending', status: 'pending' },
      { employee: empMap['EMP-010'], period: 'Q1 2025', reviewer: adminUser!._id, selfAssessment: 'pending', status: 'pending' },
    ]);
    console.log('Created performance reviews');
  }

  // Payroll
  if ((await PayrollRun.countDocuments()) === 0) {
    await PayrollRun.insertMany([
      { month: 1, year: 2025, totalAmount: 1850000, payslipCount: 16, status: 'processed', processedAt: new Date('2025-02-01') },
      { month: 12, year: 2024, totalAmount: 1820000, payslipCount: 16, status: 'processed', processedAt: new Date('2025-01-01') },
      { month: 2, year: 2025, totalAmount: 0, payslipCount: 0, status: 'draft' },
    ]);
    console.log('Created payroll runs');
  }

  // Engagement
  if ((await EngagementSurvey.countDocuments()) === 0) {
    await EngagementSurvey.insertMany([
      { name: 'Annual Engagement Survey 2024', type: 'Annual', launchDate: new Date('2024-11-01'), responses: 14, totalEmployees: 16, status: 'completed' },
      { name: 'Pulse Survey - Q1 2025', type: 'Pulse', launchDate: new Date('2025-01-15'), responses: 11, totalEmployees: 16, status: 'active' },
    ]);
    console.log('Created engagement surveys');
  }

  // Reports
  if ((await Report.countDocuments()) === 0 && adminUser) {
    await Report.insertMany([
      { name: 'Q4 2024 Summary Report', type: 'Summary', project: project._id, periodStart: new Date('2024-10-01'), periodEnd: new Date('2024-12-31'), format: 'pdf', generatedBy: adminUser._id },
      { name: 'Budget Utilization FY24-25', type: 'Budget', project: project._id, periodStart: new Date('2024-04-01'), periodEnd: new Date('2025-03-31'), format: 'excel', generatedBy: adminUser._id },
      { name: 'Activity Progress - Nov 2024', type: 'Activity', project: project._id, periodStart: new Date('2024-11-01'), periodEnd: new Date('2024-11-30'), format: 'pdf', generatedBy: adminUser._id },
    ]);
    console.log('Created reports');
  }

  console.log('\nSeed completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
