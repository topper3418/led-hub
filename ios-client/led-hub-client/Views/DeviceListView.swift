//
//  DeviceListView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/17/25.
//

// Views/DeviceListView.swift
import SwiftUI

struct DeviceListView: View {
    let roomId: Int
    @StateObject private var roomService = RoomService()
    @StateObject private var deviceService = DeviceService()
    @State private var room: Room?
    @State private var deviceIds: [Int] = []
    @State private var errorMessage: String?
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack {
            if room == nil {
                Text("Loading...")
                    .foregroundColor(.primary)
            } else if let devices = room?.devices, !devices.isEmpty {
                List {
                    ForEach(deviceIds, id: \.self) {
                        deviceId in
                        NavigationLink(destination: LedStripControlView(deviceId: deviceId)) {
                            DeviceCardView(deviceId: deviceId, deviceService: deviceService)
                        }
                    }
                }
            } else {
                Text("No devices found")
                    .foregroundColor(.secondary)
            }
        }
        .navigationTitle(room?.name ?? "Unnamed Room")
        .toolbar {
            NavigationLink(destination: RoomConfiguratorView(roomId: roomId)) {
                Image(systemName: "gear")
            }
        }
        .task {
            await loadRoom()
        }
    }
    
    private func loadRoom() async {
        do {
            room = try await roomService.fetchOne(id: roomId)
            deviceIds = room?.devices?.map((\.identifiableId)) ?? []
            print("got room \(roomId): \(String(describing: room))")
        } catch {
            print("Error loading room \(roomId): \(error)")
        }
    }
}

#Preview {
    DeviceListView(roomId: 1)
}
