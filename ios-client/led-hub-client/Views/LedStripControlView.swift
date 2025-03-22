//
//  LedStripControlView.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/17/25.
//

// Views/DeviceControlView.swift
// Views/DeviceControlView.swift
import SwiftUI

struct LedStripControlView: View {
    let deviceId: Int
    @StateObject private var deviceService = DeviceService()
    @State private var device: Device?
    @State private var isOn: Bool = false
    @State private var color: Color = .white
    @State private var brightness: Double = 100.0
    @Environment(\.dismiss) var dismiss
    
    private var deviceIdentifier: String {
        device?.name ?? device?.mac ?? "Device \(deviceId)"
    }
    
    var body: some View {
        VStack(spacing: 20) {
            if device != nil {
                Toggle("Power", isOn: $isOn)
                    .onChange(of: isOn) { _, newValue in
                        updateLedStrip()
                    }
                
                ColorPicker("LED Color", selection: $color, supportsOpacity: false)
                    .onChange(of: color) { _, _ in
                        updateLedStrip()
                    }
                
                VStack {
                    Text("Brightness: \(Int(brightness))")
                        .foregroundColor(.primary)
                    Slider(value: $brightness, in: 0...255, step: 1)
                        .onChange(of: brightness) { _, _ in
                            updateLedStrip()
                        }
                }
                
                Spacer()
                
                Button("Back") {
                    dismiss()
                }
                .buttonStyle(.bordered)
            } else {
                Text("Loading...")
                    .foregroundColor(.primary)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .navigationTitle(deviceIdentifier)
        .toolbar {
            NavigationLink(destination: LedStripConfiguratorView(deviceId: deviceId)) {
                Image(systemName: "gear")
            }
        }
        .task {
            await loadDevice()
        }
    }
    
    private func loadDevice() async {
        do {
            let fetchedDevice = try await deviceService.fetchOne(deviceId: deviceId)
            device = fetchedDevice
            if let ledStrip = fetchedDevice.ledStrip {
                isOn = ledStrip.on ?? false
                color = Color(red: Double(ledStrip.red ?? 255) / 255,
                            green: Double(ledStrip.green ?? 255) / 255,
                            blue: Double(ledStrip.blue ?? 255) / 255)
                brightness = Double(ledStrip.brightness ?? 100)
            }
        } catch {
            print("Error loading device \(deviceId): \(error)")
        }
    }
    
    private func updateLedStrip() {
        guard device != nil else { return }
        Task {
            do {
                let (red, green, blue) = colorToRGB(color)
                try await deviceService.setLedStrip(
                    deviceId: deviceId,
                    on: isOn,
                    red: red,
                    green: green,
                    blue: blue,
                    brightness: Int(brightness)
                )
            } catch {
                print("Error updating LED strip for device \(deviceId): \(error)")
            }
        }
    }
    
    private func colorToRGB(_ color: Color) -> (red: Int, green: Int, blue: Int) {
        let uiColor = UIColor(color)
        var red: CGFloat = 0
        var green: CGFloat = 0
        var blue: CGFloat = 0
        uiColor.getRed(&red, green: &green, blue: &blue, alpha: nil)
        return (Int(red * 255), Int(green * 255), Int(blue * 255))
    }
}

#Preview {
    LedStripControlView(deviceId: 1)
}
