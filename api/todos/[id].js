export default async function handler(req, res) {
  const { method, body, headers, query } = req;
  const { id } = query;
  
  const targetUrl = `https://todo.mazrean.com/api/todos/${id}`;
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }
  
  try {
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers.authorization && { authorization: headers.authorization }),
      },
    };
    
    // Add body for PUT requests
    if (method === 'PUT' && body) {
      requestOptions.body = JSON.stringify(body);
    }
    
    const apiResponse = await fetch(targetUrl, requestOptions);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Get response data
    const contentType = apiResponse.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await apiResponse.json();
    } else {
      data = await apiResponse.text();
    }
    
    // Return response with same status code
    res.status(apiResponse.status);
    
    if (typeof data === 'object') {
      res.json(data);
    } else {
      res.send(data);
    }
    
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 