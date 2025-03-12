const fetchAllStrains = async () => {
  try {
    // Add a timeout for fetch to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    console.log('Fetching strains from API...');
    const response = await fetch('http://localhost:5000/api/all-strains', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Log response status to help diagnose issues
    console.log('API Response Status:', response.status);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    // For debugging, get the raw text first
    const rawText = await response.text();
    console.log('Raw API response:', rawText.substring(0, 200) + '...'); // Log first 200 chars
    
    // Only try to parse if we have content
    if (!rawText || rawText.trim() === '') {
      console.error('Empty response from API');
      return {};
    }
    
    // Try to parse the JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Problematic JSON:', rawText.substring(0, 200));
      return {};
    }
    
    console.log('Data parsed successfully, sample:', data.slice(0, 2));
    
    // Ensure data is an array before filtering
    if (!Array.isArray(data)) {
      console.error('API did not return an array of strains:', typeof data);
      return {};
    }
    
    // Add IDs if they don't exist (using index as fallback)
    const dataWithIds = data.map((strain, index) => ({
      ...strain,
      id: strain.id || `strain-${index}` // Use existing ID or generate one
    }));

    // Get all strains with specials_tag = true across categories
    const weeklySpecials = dataWithIds.filter(strain => strain.specials_tag === true);

    // Organize remaining data by category
    const organizedData = {
      weekly_specials: weeklySpecials,
      normal_strains: dataWithIds.filter(strain => strain.category === 'normal'),
      greenhouse_strains: dataWithIds.filter(strain => strain.category === 'greenhouse'),
      exotic_tunnel_strains: dataWithIds.filter(strain => strain.category === 'exotic'),
      indoor_strains: dataWithIds.filter(strain => strain.category === 'indoor'),
      medical_strains: dataWithIds.filter(strain => strain.category === 'medical'),
      pre_rolled: dataWithIds.filter(strain => strain.category === 'prerolled'),
      extracts_vapes: dataWithIds.filter(strain => strain.category === 'extracts'),
      edibles: dataWithIds.filter(strain => strain.category === 'edibles')
    };

    return organizedData;
  } catch (error) {
    console.error('Error fetching strains:', error);
    return {};
  }
};
  export { fetchAllStrains };

