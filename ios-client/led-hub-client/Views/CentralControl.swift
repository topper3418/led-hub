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
    
    @State private var isInitialLoad = true
    
    var body: some View {
        NavigationView {
            ZStack(alignment: .bottomTrailing) {
                VStack {
                    if let error = roomService.error?.localizedDescription {
                        Text("Error: \(error)")
                            .foregroundColor(.red)
                    } else if roomService.rooms.isEmpty && isInitialLoad && roomService.rooms.count == 0 {
                        Text("Loading...")
                            .foregroundColor(.primary)
                    } else {
                        List {
                            ForEach(roomService.rooms) { room in
                                RoomCardView(roomId: room.identifiableId, roomName: room.name, roomService: roomService)
                            }
                            RoomCardView(roomId: 0, roomName: "Misc", roomService: roomService)
                        }
                        Button(action: addRoom) {
                            Text("Add Room")
                            Image(systemName: "plus")
                                .font(.title)
                        }
                    }
                    Spacer()
                }
                .background(Color(.secondarySystemBackground))
                VStack {
                    // Voice Command Button at Bottom
                    if !speechService.message.isEmpty {
                        Text(speechService.message)
                            .foregroundColor(speechService.error == nil ? .green : .red)
                            .transition(.opacity)
                    } else if !speechService.recognizedText.isEmpty {
                        Text(speechService.recognizedText)
                            .foregroundColor(.gray)
                    }
                    Button(action: {
                        if speechService.isListening {
                            let _ = speechService.stopListening()
                            Task {
                                await speechService.sendAudioToEndpoint()
                            }
                        } else {
                            speechService.startListening()
                        }
                    }) {
                        Image(systemName: speechService.isListening ? "mic.slash.fill" : "mic.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.white)
                            .frame(width: 75, height: 75)
                            .background(speechService.isListening ? Color.red : Color.blue)
                            .clipShape(Circle())
                    }
                    .padding(.trailing, 16)
                    .padding(.bottom, 16)
                }
                .background(Color(.secondarySystemBackground))
                .navigationTitle("LED Hub")
                .toolbar {
                    NavigationLink(destination: MainConfiguratorView()) {
                        Image(systemName: "gear")
                    }
                }
            }
            .task {
                _ = await roomService.fetchAll()
                isInitialLoad = false
                roomService.startPolling()
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
