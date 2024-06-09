import socket
import select

# Create a TCP/IP socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind(('0.0.0.0', 80))
server_socket.listen(5)
server_socket.setblocking(False)

# List of sockets to monitor for incoming data
sockets_list = [server_socket]
clients = {}

print("Server listening on port 80")

def handle_client_data(client_socket):
    try:
        data = client_socket.recv(1024)
        if data:
            # Process the received data (e.g., RC commands)
            print(f"Received data: {data}")
            # Send acknowledgment or response if needed
            client_socket.send(b'ACK')
        else:
            # No data means the client has disconnected
            sockets_list.remove(client_socket)
            client_socket.close()
            print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")

while True:
    # Use select to wait for events on the sockets
    readable, _, _ = select.select(sockets_list, [], [])

    for s in readable:
        if s is server_socket:
            # A new client connection
            client_socket, client_address = server_socket.accept()
            print(f"New connection from {client_address}")
            client_socket.setblocking(False)
            sockets_list.append(client_socket)
            clients[client_socket] = client_address
        else:
            # Handle data from an existing client
            handle_client_data(s)
