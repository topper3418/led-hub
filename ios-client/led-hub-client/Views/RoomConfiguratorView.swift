//
//  RoomCofiguratorView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

import SwiftUI

struct RoomCofiguratorView: View {
    @Environment(\.dismiss) var dismiss
    let room: Room
    @State private var name: String
    @ObservedObject var apiService: APIService
    
    init(room: Room) {
        self.room = room
        self.apiService = APIService()
        _name = State(initialValue: room.name)
    }
    
    var body: some View {
        VStack {
            Text("Configure \(room.name)")
                .font(.title)
                .foregroundColor(.white)
            TextField("Room name", text: $name)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .foregroundColor(.white)
                .padding()
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
                Button(action: delete) {
                    Image(systemName: "trash")
                }
                .buttonStyle(.bordered)
                .tint(.red)
            }
        }
        .padding()
        .background(Color(.systemGray6))
    }
    
    private func save() {
        Task {
            var updatedRoom = room
            updatedRoom.name = name
            do {
                try await apiService.updateRoom(updatedRoom)
                dismiss()
            } catch {
                print("Error saving room: \(error)")
            }
        }
    }
    
    private func delete() {
        Task {
            do {
                try await apiService.deleteRoom(id: room.id)
                dismiss()
            } catch {
                print("Error deleting room: \(error)")
            }
        }
    }
}

#Preview {
    RoomCofiguratorView()
}
