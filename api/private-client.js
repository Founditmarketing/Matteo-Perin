// Vercel Serverless Function: /api/private-client
// Receives private client form data and syncs to HubSpot Contacts API
// Also creates an engagement note with all rich data fields

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!hubspotToken) {
    console.error('[HubSpot] HUBSPOT_ACCESS_TOKEN not configured');
    return res.status(200).json({ success: true, message: 'Received (no HubSpot token configured)' });
  }

  try {
    const data = req.body;
    const formType = data.formType || 'private-client'; // 'private-client', 'contact', 'newsletter'

    // ─── Build contact properties ───
    const nameParts = (data.fullName || data.name || '').trim().split(' ');
    const firstname = data.preferredName || nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';
    const email = (data.email || '').trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      console.log(`[HubSpot] Invalid or missing email: "${email}" — skipping CRM sync`);
      // Still return success so the UX isn't broken
      return res.status(200).json({ success: true, message: 'Received (email invalid, not synced to CRM)' });
    }

    // Standard HubSpot contact properties
    const properties = {
      email,
      firstname,
      lastname,
      hs_marketable_status: 'true',
      hs_marketable_reason_id: 'FORM_SUBMISSION',
      hs_marketable_reason_type: 'FORM_SUBMISSION',
    };

    // Add phone if provided
    if (data.phone) properties.phone = data.phone;
    // Add address if provided
    if (data.primaryResidence || data.address) {
      properties.address = data.primaryResidence || data.address || '';
    }
    // Add lifecycle stage
    properties.lifecyclestage = 'lead';
    // Add lead source
    properties.hs_lead_status = 'NEW';

    // Capture UTM params for attribution tracking
    if (data.utm_source) properties.utm_source = data.utm_source;
    if (data.utm_medium) properties.utm_medium = data.utm_medium;
    if (data.utm_campaign) properties.utm_campaign = data.utm_campaign;
    if (data.utm_term) properties.utm_term = data.utm_term;
    if (data.utm_content) properties.utm_content = data.utm_content;
    if (data.referrer) properties.hs_analytics_source_data_1 = data.referrer;
    if (data.landingPage) properties.hs_analytics_first_url = data.landingPage;

    // ─── Step 1: Create or update the contact ───
    let contactId = null;

    // Try to create
    let createRes;
    try {
      createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hubspotToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
    } catch (fetchErr) {
      console.error(`[HubSpot] Network error creating contact:`, fetchErr.message);
      return res.status(200).json({ success: true, message: 'Received (network error, queued)' });
    }

    const createData = await createRes.json();

    if (createRes.ok) {
      contactId = createData.id;
      console.log(`[HubSpot] Contact created: ${contactId} (${email})`);
    } else if (createRes.status === 409) {
      // Contact exists — extract ID and update
      const existingId = createData?.message?.match(/Existing ID: (\d+)/)?.[1];
      if (existingId) {
        contactId = existingId;
        // Update the existing contact
        try {
          const updateRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${hubspotToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ properties }),
          });
          if (updateRes.ok) {
            console.log(`[HubSpot] Contact updated: ${contactId} (${email})`);
          } else {
            const errData = await updateRes.json();
            console.error(`[HubSpot] Update failed:`, JSON.stringify(errData));
          }
        } catch (updateErr) {
          console.error(`[HubSpot] Network error updating contact:`, updateErr.message);
        }
      }
    } else {
      console.error(`[HubSpot] Create failed:`, JSON.stringify(createData));
    }

    // ─── Step 2: Add to HubSpot static list (for newsletter/subscriber segmentation) ───
    if (contactId) {
      const listId = process.env.HUBSPOT_NEWSLETTER_LIST_ID;
      if (listId) {
        try {
          const listRes = await fetch(`https://api.hubapi.com/crm/v3/lists/${listId}/memberships/add`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${hubspotToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([contactId]),
          });
          if (listRes.ok) {
            console.log(`[HubSpot] Contact ${contactId} added to list ${listId}`);
          } else {
            const listErr = await listRes.json();
            console.error(`[HubSpot] List add failed:`, JSON.stringify(listErr));
          }
        } catch (listNetErr) {
          console.error(`[HubSpot] Network error adding to list:`, listNetErr.message);
        }
      }
    }

    // ─── Step 3: Create an engagement note with ALL the rich data ───
    if (contactId && formType !== 'newsletter') {
      let noteBody = '';

      if (formType === 'private-client') {
        noteBody = [
          `═══ PRIVATE CLIENT PROFILE ═══`,
          `Submitted: ${data.submittedAt || new Date().toISOString()}`,
          ``,
          `── IDENTITY ──`,
          `Name: ${data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'N/A'}`,
          `Email: ${data.email || 'N/A'}`,
          `Phone: ${data.phone || 'N/A'}`,
          ``,
          `── RESIDENCES ──`,
          `Primary: ${data.primaryResidence || 'N/A'}`,
          `Secondary: ${data.secondaryResidence || 'N/A'}`,
          ``,
          `── CLIENT HISTORY ──`,
          `First Engagement: ${data.firstEngagement || 'N/A'}`,
          `First Acquisition: ${data.firstAcquisition || 'N/A'}`,
          `Additional Commissions: ${data.additionalCommissions || 'N/A'}`,
          ``,
          `── PERSONAL DATES ──`,
          `Birthday: ${data.birthday || 'N/A'}`,
          `Partner Birthday: ${data.partnerBirthday || 'N/A'}`,
          `Anniversary: ${data.anniversary || 'N/A'}`,
          `Milestones: ${data.milestones || 'N/A'}`,
          ``,
          `── PREFERENCES ──`,
          `Interests: ${data.interests || 'N/A'}`,
          `Private Previews: ${data.privatePreviews || 'N/A'}`,
          `Values Most: ${data.valueMost || 'N/A'}`,
          ``,
          `── ATTRIBUTION ──`,
          `UTM Source: ${data.utm_source || 'N/A'}`,
          `UTM Medium: ${data.utm_medium || 'N/A'}`,
          `UTM Campaign: ${data.utm_campaign || 'N/A'}`,
          `UTM Term: ${data.utm_term || 'N/A'}`,
          `Referrer: ${data.referrer || 'N/A'}`,
          `Landing Page: ${data.landingPage || 'N/A'}`,
        ].join('\n');
      } else if (formType === 'contact') {
        noteBody = [
          `═══ WEBSITE INQUIRY ═══`,
          `Submitted: ${new Date().toISOString()}`,
          ``,
          `Name: ${data.name || 'N/A'}`,
          `Email: ${data.email || 'N/A'}`,
          `Phone: ${data.phone || 'N/A'}`,
          `Subject: ${data.subject || 'N/A'}`,
          `Message: ${data.message || 'N/A'}`,
        ].join('\n');
      } else if (formType === 'look-inquiry') {
        noteBody = [
          `═══ LOOKBOOK INQUIRY ═══`,
          `Submitted: ${new Date().toISOString()}`,
          ``,
          `Name: ${data.name || 'N/A'}`,
          `Email: ${data.email || 'N/A'}`,
          `Phone: ${data.phone || 'N/A'}`,
          `Best Time to Contact: ${data.contactTime || 'N/A'}`,
          `Requested Product: ${data.requestedProduct ? (data.requestedProduct.title + " (" + data.requestedProduct.reference + ")") : 'General Inquiry'}`,
          `Message: ${data.message || 'N/A'}`,
        ].join('\n');
      }

      if (noteBody) {
        const noteRes = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              hs_timestamp: new Date().toISOString(),
              hs_note_body: noteBody,
            },
            associations: [
              {
                to: { id: contactId },
                types: [
                  {
                    associationCategory: 'HUBSPOT_DEFINED',
                    associationTypeId: 202, // Note to Contact
                  },
                ],
              },
            ],
          }),
        });

        if (noteRes.ok) {
          console.log(`[HubSpot] Note created for contact ${contactId}`);
        } else {
          const noteErr = await noteRes.json();
          console.error(`[HubSpot] Note creation failed:`, JSON.stringify(noteErr));
        }
      }
    }

    return res.status(200).json({
      success: true,
      contactId,
      message: `Profile synced to HubSpot (${formType})`,
    });
  } catch (err) {
    console.error('[HubSpot] Error:', err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
