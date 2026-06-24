const fs = require('fs');

let formContent = fs.readFileSync('src/Component/Pages/Dashboards/Tabs/Sales/FollowUpOnboardingForm.jsx', 'utf8');

formContent = formContent.replace(/FollowUp/g, 'Closure');
formContent = formContent.replace(/followUp/g, 'closure');
formContent = formContent.replace(/Follow-up/g, 'Closure');
formContent = formContent.replace(/follow-ups/g, 'closures');
formContent = formContent.replace(/Follow-ups/g, 'Closures');

// Fix specific labels for closures
formContent = formContent.replace(/Date & Time/g, 'Agreement Signed');
formContent = formContent.replace(/Contact Person/g, 'Payment Done');
formContent = formContent.replace(/Notes \/ Remarks/g, 'Remarks');
formContent = formContent.replace(/Proposal Date/g, 'Closure Date');
formContent = formContent.replace(/Proposal Time/g, 'Payment Amount');

fs.writeFileSync('src/Component/Pages/Dashboards/Tabs/Sales/ClosureOnboardingForm.jsx', formContent);

let tabContent = fs.readFileSync('src/Component/Pages/Dashboards/Tabs/Sales/FollowUpsTab.jsx', 'utf8');

tabContent = tabContent.replace(/FollowUp/g, 'Closure');
tabContent = tabContent.replace(/followUp/g, 'closure');
tabContent = tabContent.replace(/Follow-up/g, 'Closure');
tabContent = tabContent.replace(/follow-ups/g, 'closures');
tabContent = tabContent.replace(/Follow-ups/g, 'Closures');

tabContent = tabContent.replace(/Date & Time/g, 'Closure Date');
tabContent = tabContent.replace(/Contact Person/g, 'Payment Status');

// Fix initial data array
tabContent = tabContent.replace(/date: '2026-05-26', contactPerson: 'Mukesh Ambani'/g, "date: '2026-05-26', contactPerson: 'Done'");
tabContent = tabContent.replace(/date: '2026-05-27', contactPerson: 'Ratan Tata'/g, "date: '2026-05-27', contactPerson: 'Pending'");
tabContent = tabContent.replace(/date: '2026-05-28', contactPerson: 'Gautam Adani'/g, "date: '2026-05-28', contactPerson: 'Done'");

// Fix dropdown statuses for Closure
tabContent = tabContent.replace(/pending/g, 'in-progress');
tabContent = tabContent.replace(/Pending/g, 'In-Progress');
tabContent = tabContent.replace(/PENDING/g, 'IN-PROGRESS');
tabContent = tabContent.replace(/completed/g, 'closed');
tabContent = tabContent.replace(/Completed/g, 'Closed');
tabContent = tabContent.replace(/COMPLETED/g, 'CLOSED');

fs.writeFileSync('src/Component/Pages/Dashboards/Tabs/Sales/ClosuresTab.jsx', tabContent);
