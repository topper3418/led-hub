//
//  RoomListView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

import SwiftUI

struct RoomListView: View {
    @StateObject private var roomService = RoomService()
    @State private var miscRoomId: Int? = 0 // Misc room is always ID 0
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        NavigationView {
            VStack {
                if let error = roomService.error?.localizedDescription {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                } else if roomService.rooms.isEmpty && miscRoomId == nil {
                    Text("Loading...")
                        .foregroundColor(.primary)
                } else {
                    List {
                        ForEach(roomService.rooms) { room in
                            NavigationLink(destination: DeviceListView(roomId: room.identifiableId, roomName: room.name)) {
                                RoomCardView(roomId: room.identifiableId, roomName: room.name, roomService: roomService)
                            }
                        }
                    RoomCardView(roomId: 0, roomName: "Misc", roomService: roomService)
                    }
                }
            }
            .background(Color(.secondarySystemBackground))
            .navigationTitle("LED Hub")
            .toolbar {
                Button(action: addRoom) {
                    Image(systemName: "plus")
                        .font(.title)
                }
            }
            .task {
                _ = await roomService.fetchAll()
            }
        }
        .background(Color(.systemBackground))
    }
    
    private func addRoom() {
        Task {
            do {
                let newRoom = try await roomService.add()
            } catch {
                print("Error adding room: \(error)")
            }
        }
    }
}

#Preview {
    RoomListView()
}
