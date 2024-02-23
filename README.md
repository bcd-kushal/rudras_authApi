
# Auth Provider

Welcome to the Authentication Provider API documentation. This API allows you to integrate authentication services into your application.

API endpoint: https://auth.rudrakumarmishra.com/
# ✨ Usage
## Installation

Send API call to different routes

### In JavaScript
```javascript
const url = 'https://auth.rudrakumarmishra.com/';

// Make a GET request
fetch(url, {
  method: 'GET',
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Data:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### In Python
```python
import requests

url = 'https://auth.rudrakumarmishra.com/'

# Make a GET request
response = requests.get(url)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    data = response.json()
    print('Data:', data)
else:
    print('Error:', response.status_code, response.text)
```

# 🤝 Contribution
This project is open to contribution, if interested then mail me at dev@rudrakumarmishra.com
