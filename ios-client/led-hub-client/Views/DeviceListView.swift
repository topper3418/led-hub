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
    let roomName: String
    @StateObject private var deviceService = DeviceService()
    @State private var room: Room?
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack {
            if deviceService.devices.isEmpty {
                Text("Loading...")
                    .foregroundColor(.primary)
            } else if !deviceService.devices.isEmpty {
                List {
                    ForEach(deviceService.devices) {
                        device in
                        NavigationLink(destination: LedStripControlView(deviceId: device.identifiableId)) {
                            DeviceCardView(
                                deviceId: device.identifiableId,
                                givenName: device.name ?? device.mac ?? "Device \(device.identifiableId)",
                                deviceService: deviceService
                            )
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
            _ = await deviceService.fetchDevices(roomId: roomId)
        }
    }
}

#Preview {
    DeviceListView(roomId: 1, roomName: "Preview Room")
}
