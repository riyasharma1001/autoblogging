export async function getSiteSettings() {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    }
  }
  
  // If on server side, use direct import
  const { getSettings } = await import('../lib/settings-server');
  return getSettings();
}

export async function updateSiteSettings(settings) {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
    return response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}