//
//  LedStripConfigurator.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/18/25.
//

import SwiftUI

struct LedStripConfiguratorView: View {
    let deviceId: Int
    @StateObject private var deviceService = DeviceService()
    @StateObject private var roomService = RoomService()
    @State private var device: Device?
    @State private var name: String = ""
    @State private var roomId: Int = 0
    @State private var numLeds: String = "0"
    @State private var ledPin: String = "16"
    @State private var rooms: [Room] = []
    @Environment(\.dismiss) var dismiss
    
    private var deviceIdentifier: String {
        device?.name ?? device?.mac ?? "Device \(deviceId)"
    }
    
    var body: some View {
        VStack(spacing: 20) {
            if device != nil {
                TextField("Device name", text: $name)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .foregroundColor(.primary)
                
                Picker("Room", selection: $roomId) {
                    Text("Select a room").tag(0)
                    ForEach(rooms, id: \.identifiableId) { room in
                        Text(room.name).tag(room.id ?? 0)
                    }
                }
                .pickerStyle(MenuPickerStyle())
                
                TextField("Num LEDs", text: $numLeds)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numberPad)
                    .foregroundColor(.primary)
                
                TextField("LED Pin", text: $ledPin)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numberPad)
                    .foregroundColor(.primary)
                
                Spacer()
                
                HStack {
                    Button("Save") {
                        save()
                    }
                    .buttonStyle(.borderedProminent)
                    
                    Button(action: destroy) {
                        Image(systemName: "trash")
                    }
                    .buttonStyle(.bordered)
                    .tint(.red)
                }
            } else {
                Text("Loading...")
                    .foregroundColor(.primary)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .navigationTitle("Configure \(deviceIdentifier)")
        .task {
            await loadData()
        }
    }
    
    private func loadData() async {
        do {
            let fetchedDevice = try await deviceService.fetchOne(deviceId: deviceId)
            device = fetchedDevice
            name = fetchedDevice.name ?? ""
            roomId = fetchedDevice.roomId ?? 0
            numLeds = String(fetchedDevice.ledStrip?.numLeds ?? 0)
            ledPin = String(fetchedDevice.ledStrip?.ledPin ?? 16)
            
            let fetchedRooms = try await roomService.fetchAll()
            rooms = fetchedRooms
        } catch {
            print("Error loading data for device \(deviceId): \(error)")
        }
    }
    
    private func save() {
        guard var device = device else { return }
        Task {
            do {
                device.name = name
                device.roomId = roomId
                device.ledStrip?.numLeds = Int(numLeds) ?? 0
                device.ledStrip?.ledPin = Int(ledPin) ?? 16
                try await deviceService.update(device)
                dismiss()
            } catch {
                print("Error saving device \(deviceId): \(error)")
            }
        }
    }
    
    private func destroy() {
        Task {
            do {
                try await deviceService.delete(deviceId: deviceId)
                dismiss()
            } catch {
                print("Error deleting device \(deviceId): \(error)")
            }
        }
    }
}

#Preview {
    LedStripConfiguratorView(deviceId: 1)
}
