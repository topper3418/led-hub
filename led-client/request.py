# request.py
import socket
import json
from config import SERVER_ADDRESS, SERVER_PORT, SERVER_ENDPOINT

def fetch_data(relative_url: str, method="GET", data=None, redirect_count=0, max_redirects=5) -> dict:
    """
    Fetch JSON data from the server using a socket, supporting GET and POST with optional data.
    Args:
        relative_url (str): The relative path (e.g., 'devices/1/led_strip')
        method (str): HTTP method ('GET' or 'POST', default 'GET')
        data (dict): Data to send in the request body (for POST), will be JSON-encoded
        redirect_count (int): Number of redirects followed (to prevent loops)
        max_redirects (int): Maximum number of redirects to follow
    Returns:
        dict: Parsed JSON response, or None if the request fails
    """
    if redirect_count >= max_redirects:
        print("Too many redirects")
        return None

    try:
        # Parse SERVER_ENDPOINT (e.g., 'http://example.com:8080/')
        if SERVER_ENDPOINT.startswith("http://"):
            url = SERVER_ENDPOINT[7:]  # Strip "http://"
        else:
            url = SERVER_ENDPOINT
        
        # Combine with relative URL, ensuring no double slashes
        path = "/" + relative_url.lstrip("/")
        
        # Create socket and connect
        addr_info = socket.getaddrinfo(SERVER_ADDRESS, SERVER_PORT)[0][-1]
        s = socket.socket()
        s.connect(addr_info)
        
        # Prepare request body and headers
        body = ""
        headers = f"Host: {SERVER_ADDRESS}\r\nConnection: close"
        if method.upper() == "POST" and data is not None:
            body = json.dumps(data)  # Convert dict to JSON string
            headers += f"\r\nContent-Type: application/json\r\nContent-Length: {len(body)}"
        
        # Send HTTP request
        request = f"{method.upper()} {path} HTTP/1.1\r\n{headers}\r\n\r\n"
        if body:
            request += body
        s.settimeout(0.25)
        s.send(request.encode("utf-8"))
        
        # Receive response
        response = b""
        while True:
            data_chunk = s.recv(1024)
            if not data_chunk:
                break
            response += data_chunk
        
        # Close socket
        s.close()
        
        # Split headers and body
        header_end = response.find(b"\r\n\r\n")
        if header_end == -1:
            print("Invalid HTTP response: No header-body separator")
            print("Raw response:", response)
            return None
        
        headers = response[:header_end].decode("utf-8")
        body = response[header_end + 4:].decode("utf-8")
        
        # Parse status code
        status_line = headers.split("\r\n")[0]
        status_code = int(status_line.split(" ")[1])
        
        print("Status code:", status_code)
        print("Received data:", body)
        
        # Handle redirects (301, 302, 303, 307, 308)
        if status_code in (301, 302, 303, 307, 308):
            for line in headers.split("\r\n"):
                if line.lower().startswith("location:"):
                    new_url = line.split(":", 1)[1].strip()
                    print(f"Redirecting to: {new_url}")
                    if new_url.startswith("http://"):
                        new_relative = new_url.split("/", 3)[3] if len(new_url.split("/")) > 3 else ""
                    else:
                        new_relative = new_url.lstrip("/")
                    # For POST redirects, typically switch to GET unless 307/308
                    new_method = "GET" if status_code in (301, 302, 303) else method
                    return fetch_data(new_relative, method=new_method, data=None if new_method == "GET" else data,
                                    redirect_count=redirect_count + 1, max_redirects=max_redirects)
            print("Redirect found but no Location header")
            return None
        
        # Check for success
        if status_code != 200:
            print(f"HTTP error: {status_code}")
            return None
        
        # Parse JSON body
        if not body.strip():
            print("Empty response body")
            return None
        return json.loads(body)
    
    except Exception as e:
        print("Error in fetch_data:", e)
        print("Raw response:", response if 'response' in locals() else "No response received")
        return None
