const fs = require('fs');

let formContent = fs.readFileSync('src/Component/Pages/Dashboards/Tabs/Sales/FollowUpOnboardingForm.jsx', 'utf8');

formContent = formContent.replace(/FollowUp/g, 'Proposal');
formContent = formContent.replace(/followUp/g, 'proposal');
formContent = formContent.replace(/Follow-up/g, 'Proposal');
formContent = formContent.replace(/follow-ups/g, 'proposals');
formContent = formContent.replace(/Follow-ups/g, 'Proposals');

// Fix specific labels for proposals
formContent = formContent.replace(/Date & Time/g, 'Proposal Value');
formContent = formContent.replace(/Contact Person/g, 'Proposal Document Link');

fs.writeFileSync('src/Component/Pages/Dashboards/Tabs/Sales/ProposalOnboardingForm.jsx', formContent);

let tabContent = fs.readFileSync('src/Component/Pages/Dashboards/Tabs/Sales/FollowUpsTab.jsx', 'utf8');

tabContent = tabContent.replace(/FollowUp/g, 'Proposal');
tabContent = tabContent.replace(/followUp/g, 'proposal');
tabContent = tabContent.replace(/Follow-up/g, 'Proposal');
tabContent = tabContent.replace(/follow-ups/g, 'proposals');
tabContent = tabContent.replace(/Follow-ups/g, 'Proposals');
tabContent = tabContent.replace(/Date & Time/g, 'Proposal Value');
tabContent = tabContent.replace(/Contact Person/g, 'Sent By');

// Fix initial data array
tabContent = tabContent.replace(/date: '2026-05-26', contactPerson: 'Mukesh Ambani'/g, "date: '₹12,50,000', contactPerson: 'John Doe'");
tabContent = tabContent.replace(/date: '2026-05-27', contactPerson: 'Ratan Tata'/g, "date: '₹8,00,000', contactPerson: 'Jane Smith'");
tabContent = tabContent.replace(/date: '2026-05-28', contactPerson: 'Gautam Adani'/g, "date: '₹20,00,000', contactPerson: 'Alex'");

// Fix dropdown statuses for Proposal
tabContent = tabContent.replace(/pending/g, 'sent');
tabContent = tabContent.replace(/Pending/g, 'Sent');
tabContent = tabContent.replace(/PENDING/g, 'SENT');
tabContent = tabContent.replace(/completed/g, 'accepted');
tabContent = tabContent.replace(/Completed/g, 'Accepted');
tabContent = tabContent.replace(/COMPLETED/g, 'ACCEPTED');

fs.writeFileSync('src/Component/Pages/Dashboards/Tabs/Sales/ProposalsTab.jsx', tabContent);
