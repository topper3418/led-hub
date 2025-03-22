//
//  DeviceCardView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/17/25.
//

// Views/DeviceCardView.swift
// Views/DeviceCardView.swift
import SwiftUI

struct DeviceCardView: View {
    let deviceId: Int // Changed to only take deviceId
    @ObservedObject var deviceService: DeviceService// Fetch data itself
    @State private var device: Device? // Store fetched device
    @State private var isOn: Bool = false // Initial state until fetched
    @State private var timer: Timer?
    @State private var isServerToggle: Bool = false
    
    var body: some View {
        Group {
            if let device = device {
                HStack {
                    VStack(alignment: .leading) {
                        Text(device.name ?? device.mac ?? "Device \(deviceId)")
                            .foregroundColor(.primary)
                            .font(.headline)
                        Text(connectionStatus)
                            .font(.caption)
                            .foregroundColor(connectionColor)
                    }
                    Spacer()
                    Toggle("", isOn: $isOn)
                        .onChange(of: isOn) { oldValue, newValue in
                            if !isServerToggle {
                                toggleLedStrip(newValue)
                            }
                            isServerToggle = false
                        }
                        .disabled(device.id == nil)
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)
            } else {
                Text("Loading Device...")
                    .foregroundColor(.primary)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(8)
            }
        }
        .task {
            await loadDevice()
            startPolling()
        }
        .onDisappear {
            stopPolling()
        }
    }
    
    private var connectionStatus: String {
        guard let lastPing = device?.lastPing, let pingDate = ISO8601DateFormatter().date(from: lastPing) else {
            return "Connection: Unknown"
        }
        let dwell = Date().timeIntervalSince(pingDate)
        if dwell < 2 {
            return "Connection: Healthy"
        } else if dwell < 5 {
            return "Connection: Weak"
        } else {
            return "Connection: Dead"
        }
    }
    
    private var connectionColor: Color {
        guard let lastPing = device?.lastPing, let pingDate = ISO8601DateFormatter().date(from: lastPing) else {
            return .gray
        }
        let dwell = Date().timeIntervalSince(pingDate)
        return dwell < 2 ? .green : dwell < 5 ? .yellow : .red
    }
    
    private func toggleLedStrip(_ newValue: Bool) {
        Task {
            stopPolling()
            do {
                try await deviceService.setLedStrip(deviceId: deviceId, on: newValue)
                await loadDevice() // Refresh immediately after toggle
                startPolling()
            } catch {
                print("Error toggling device \(deviceId): \(error)")
                startPolling()
            }
        }
    }
    
    private func startPolling() {
        stopPolling()
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
            Task {
                await updateState()
            }
        }
    }
    
    private func stopPolling() {
        timer?.invalidate()
        timer = nil
    }
    
    private func loadDevice() async {
        do {
            print("fetching one for \(deviceId)")
            let fetchedDevice = try await deviceService.fetchOne(deviceId: deviceId)
            print("fetched one for \(deviceId)")
            device = fetchedDevice
            if let newIsOn = fetchedDevice.ledStrip?.on, newIsOn != isOn {
                isServerToggle = true
                isOn = newIsOn
            }
            print("Device loaded: \(deviceId)")
        } catch {
            print("Error loading device \(deviceId): \(error)")
        }
    }
    
    private func updateState() async {
        do {
            let fetchedDevice = try await deviceService.fetchOne(deviceId: deviceId)
            if let newIsOn = fetchedDevice.ledStrip?.on, newIsOn != isOn {
                isServerToggle = true
                isOn = newIsOn
            }
            device = fetchedDevice // Update device for connection status
            print("Device updated: \(deviceId)")
        } catch {
            print("Error updating device \(deviceId): \(error)")
        }
    }
}

