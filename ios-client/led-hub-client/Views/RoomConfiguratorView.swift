//
//  RoomCofiguratorView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

// Views/RoomConfiguratorView.swift
import SwiftUI

struct RoomConfiguratorView: View {
    @Environment(\.dismiss) var dismiss
    let roomId: Int? // Now takes an ID
    @State private var room: Room? // Fetch room data
    @State private var name: String = ""
    @ObservedObject var apiService: RoomService
    @Environment(\.colorScheme) var colorScheme
    
    init(roomId: Int?) {
        self.roomId = roomId
        self.apiService = RoomService()
    }
    
    var body: some View {
        VStack {
            Text("Configure \(room?.name ?? "Loading...")")
                .font(.title)
                .foregroundColor(.primary)
            TextField("Room name", text: $name)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .foregroundColor(.primary)
                .padding()
                .disabled(room == nil) // Disable until loaded
            Spacer()
            HStack {
                Button("Back") {
                    dismiss()
                }
                .buttonStyle(.bordered)
                Button("Save") {
                    save()
                }
                .buttonStyle(.borderedProminent)
                .disabled(room == nil)
                Button(action: delete) {
                    Image(systemName: "trash")
                }
                .buttonStyle(.bordered)
                .tint(.red)
                .disabled(room == nil)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .task {
            await loadRoom()
        }
    }
    
    private func loadRoom() async {
        guard let id = roomId else {
            print("Room ID is nil, cannot load")
            return
        }
        do {
            let fetchedRoom = try await apiService.fetchOne(id: id)
            room = fetchedRoom
            name = fetchedRoom.name
        } catch {
            print("Error loading room \(id): \(error)")
        }
    }
    
    private func save() {
        guard let room = room else { return }
        Task {
            var updatedRoom = room
            updatedRoom.name = name
            do {
                try await apiService.update(updatedRoom)
                dismiss()
            } catch {
                print("Error saving room: \(error)")
            }
        }
    }
    
    private func delete() {
        guard let id = roomId else { return }
        Task {
            do {
                try await apiService.delete(id: id)
                dismiss()
            } catch {
                print("Error deleting room: \(error)")
            }
        }
    }
}
