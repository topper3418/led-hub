//
//  RoomCardView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

// Views/RoomCardView.swift
import SwiftUI

struct RoomCardView: View {
    let roomId: Int?
    let roomName: String?
    @ObservedObject var roomService: RoomService
    @State private var room: Room?
    @State private var isOn: Bool = false
    @State private var numLedStrips: Int = 0
    @Environment(\.colorScheme) var colorScheme
    @State private var timer: Timer?
    @State private var isServerToggle: Bool = false

    var body: some View {
        Group {
            if shouldShowCard {
                HStack {
                    VStack(alignment: .leading) {
                        Text(room?.name ?? roomName ?? "Loading...")
                            .foregroundColor(.primary)
                            .font(.headline)
                        Text("lights: \(numLedStrips)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Toggle("", isOn: $isOn)
                        .onChange(of: isOn) { oldValue, newValue in
                            if !isServerToggle {
                                toggleRoom(newValue)
                            }
                            isServerToggle = false
                        }
                        .disabled(room == nil)
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)
            } else {
                EmptyView()  // Hide the card if no lights
            }
        }
        .task {
            await updateState()
            startPolling()
        }
        .onDisappear {
            stopPolling()
        }
    }

    private var shouldShowCard: Bool {
        guard let room = room else { return true }  // Show while loading
        let hasLights =
            !(room.devices?.isEmpty ?? true)
            || !(room.ledStrips?.isEmpty ?? true)
        return hasLights || roomId != 0  // Always show non-Misc rooms
    }

    private func updateState() async {
        guard let id = roomId else {
            print("Room ID is nil, cannot fetch data")
            return
        }
        do {
            let fetchedRoom = try await roomService.fetchOne(id: id)
            room = fetchedRoom
            if let devices = fetchedRoom.devices {
                numLedStrips = devices.count
                let newIsOn = devices.allSatisfy { $0.ledStrip?.on ?? false }
                if newIsOn != isOn {  // Only update if different
                    isServerToggle = true  // Mark as server-driven
                    isOn = newIsOn
                }
            }
        } catch {
            print("Error fetching room \(id): \(error)")
        }
    }

    private func toggleRoom(_ newValue: Bool) {
        guard let id = roomId else { return }
        Task {
            stopPolling()  // Stop polling before update
            do {
                try await roomService.setRoom(roomId: id, on: newValue)
                startPolling()  // Restart polling after update
            } catch {
                print("Error toggling room \(id): \(error)")
                startPolling()  // Restart even on error to keep UI alive
            }
        }
    }

    private func startPolling() {
        stopPolling()
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) {
            _ in
            Task {
                await updateState()
            }
        }
    }

    private func stopPolling() {
        timer?.invalidate()
        timer = nil
    }
}

