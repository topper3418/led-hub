//
//  RoomListView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

import SwiftUI

struct RoomListView: View {
    @StateObject private var roomService = RoomService()
    @State private var roomIds: [Int] = [] // Store only IDs
    @State private var miscRoomId: Int? = 0 // Misc room is always ID 0
    @State private var errorMessage: String?
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        NavigationView {
            VStack {
                if let error = errorMessage {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                } else if roomIds.isEmpty && miscRoomId == nil {
                    Text("Loading...")
                        .foregroundColor(.primary)
                } else {
                    List {
                        ForEach(roomIds, id: \.self) { roomId in
                            NavigationLink(destination: DeviceListView(roomId: roomId)) {
                                RoomCardView(roomId: roomId, apiService: roomService)
                            }
                        }
                        if let miscId = miscRoomId {
                            RoomCardView(roomId: miscId, apiService: roomService)
                        }
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
                await loadData()
            }
        }
        .background(Color(.systemBackground))
    }
    
    private func loadData() async {
        do {
            let allRooms = try await roomService.fetchAll()
            roomIds = allRooms.filter { $0.id != 0 }.compactMap { $0.id }
            miscRoomId = 0 // Always include Misc room
            errorMessage = nil
        } catch {
            print("Error loading data: \(error)")
            errorMessage = error.localizedDescription
        }
    }
    
    private func addRoom() {
        Task {
            do {
                let newRoom = try await roomService.add()
                if let newId = newRoom.id {
                    roomIds.append(newId)
                }
            } catch {
                print("Error adding room: \(error)")
                errorMessage = error.localizedDescription
            }
        }
    }
}

#Preview {
    RoomListView()
}
