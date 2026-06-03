// Vercel Serverless Function: /api/setup-hubspot-list
// One-time utility — creates a "New Customers" static list in HubSpot
// Visit this endpoint once, copy the returned listId, and add it to Vercel env vars as HUBSPOT_NEWSLETTER_LIST_ID

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!hubspotToken) {
    return res.status(500).json({ error: 'HUBSPOT_ACCESS_TOKEN not configured' });
  }

  // Check if list already exists by searching
  try {
    // First, try to find existing "New Customers" list
    const searchRes = await fetch('https://api.hubapi.com/crm/v3/lists/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'New Customers',
        count: 5,
      }),
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const existing = searchData.lists?.find(l => l.name === 'New Customers');
      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'List already exists!',
          listId: existing.listId,
          name: existing.name,
          instruction: `Add this to your Vercel Environment Variables: HUBSPOT_NEWSLETTER_LIST_ID = ${existing.listId}`,
        });
      }
    }

    // Create the static list
    const createRes = await fetch('https://api.hubapi.com/crm/v3/lists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objectTypeId: '0-1', // Contacts
        processingType: 'MANUAL',
        name: 'New Customers',
        filterBranch: {
          filterBranchType: 'OR',
          filters: [],
          filterBranches: [],
        },
      }),
    });

    const createData = await createRes.json();

    if (createRes.ok) {
      return res.status(200).json({
        success: true,
        message: 'New Customers list created successfully!',
        listId: createData.listId,
        name: createData.name,
        instruction: `Add this to your Vercel Environment Variables: HUBSPOT_NEWSLETTER_LIST_ID = ${createData.listId}`,
      });
    } else {
      return res.status(400).json({
        error: 'Failed to create list',
        details: createData,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
