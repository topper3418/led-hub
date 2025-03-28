//
//  RoomListView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

import SwiftUI

struct RoomListView: View {
    @StateObject private var roomService = RoomService()
    @StateObject private var speechService = SpeechService()
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        NavigationView {
            VStack {
                if let error = roomService.error?.localizedDescription {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                } else if roomService.rooms.isEmpty {
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
                Spacer()
                // Voice Command Button at Bottom
                Button(speechService.isListening ? "Stop Listening" : "Voice Command") {
                    if speechService.isListening {
                        let buffers = speechService.stopListening()
                        Task {
                            await speechService.sendAudioToEndpoint(buffers: buffers)
                        }
                    } else {
                        speechService.startListening()
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(speechService.isListening ? Color.red : Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
                .frame(width: 250)
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
                _ = try await roomService.add()
            } catch {
                print("Error adding room: \(error)")
            }
        }
    }
}

#Preview {
    RoomListView()
}
