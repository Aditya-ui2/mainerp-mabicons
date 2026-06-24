import React from 'react';
import GenericCampaignTab from './GenericCampaignTab';

// This page now reuses the fully functional GenericCampaignTab which
// connects to the backend CRUD API for campaigns. All UI interactions
// (listing, adding, editing, deleting) work against the PostgreSQL DB.

const SalesCampaigns = () => {
  return <GenericCampaignTab notificationBell={null} />;
};

export default SalesCampaigns;