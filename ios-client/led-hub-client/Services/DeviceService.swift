//
//  DeviceService.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/17/25.
//

import Foundation

class DeviceService: ObservableObject {
    private let baseURL = "http://opperudHome.local/api/"
    
    func fetchOne(deviceId: Int) async throws -> Device {
        let urlString = "\(baseURL)devices/\(deviceId)"
        guard let url = URL(string: urlString) else {
            print("Invalid URL: \(urlString)")
            throw URLError(.badURL)
        }
        print("Fetching device \(deviceId) from: \(url)")
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            if let httpResponse = response as? HTTPURLResponse {
                print("Error: Server returned status code \(httpResponse.statusCode)")
            } else {
                print("Error: Invalid server response")
            }
            throw URLError(.badServerResponse)
        }
        struct DeviceData: Codable {
            let device: Device
        }
        struct DeviceResponse: Codable {
            let data: DeviceData
        }
        let deviceResponse = try JSONDecoder().decode(DeviceResponse.self, from: data)
        return deviceResponse.data.device
    }
    
    func update(_ device: Device) async throws {
        guard let deviceId = device.id else {
            throw URLError(.badURL)
        }
        let url = URL(string: "\(baseURL)devices/\(deviceId)")!
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        struct DeviceUpdate: Codable {
            let data: Device
        }
        let payload = DeviceUpdate(data: device)
        print("Submitting PUT request with payload: \(payload)")
        request.httpBody = try JSONEncoder().encode(payload)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            print("Failed to update device: \(String(data: data, encoding: .utf8) ?? "No response data")")
            throw URLError(.badServerResponse)
        }
    }
    
    func delete(deviceId: Int) async throws {
        let url = URL(string: "\(baseURL)devices/\(deviceId)")!
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            print("Failed to delete device: \(String(data: data, encoding: .utf8) ?? "No response data")")
            throw URLError(.badServerResponse)
        }
    }
    
    func setLedStrip(deviceId: Int, on: Bool? = nil, red: Int? = nil, green: Int? = nil, blue: Int? = nil, brightness: Int? = nil) async throws {
        let url = URL(string: "\(baseURL)devices/\(deviceId)/led_strip")!
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        struct LedStripUpdateData: Codable {
            let on: Bool?
            let red: Int?
            let green: Int?
            let blue: Int?
            let brightness: Int?
        }
        struct LedStripUpdate: Codable {
            let data: LedStripUpdateData
        }
        let payload = LedStripUpdate(data: LedStripUpdateData(on: on, red: red, green: green, blue: blue, brightness: brightness))
        print("Submitting PUT request with payload: \(payload)")
        request.httpBody = try JSONEncoder().encode(payload)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            print("Failed to update LED strip: \(String(data: data, encoding: .utf8) ?? "No response data")")
            throw URLError(.badServerResponse)
        }
    }
    
    // Optional: Add fetchDevices if your backend has a /devices endpoint
    func fetchDevices() async throws -> [Device] {
        let urlString = "\(baseURL)devices"
        guard let url = URL(string: urlString) else {
            print("Invalid URL: \(urlString)")
            throw URLError(.badURL)
        }
        print("Fetching devices from: \(url)")
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            // Move error logging inside the guard's else block
            if let httpResponse = response as? HTTPURLResponse {
                print("Error: Server returned status code \(httpResponse.statusCode)")
            } else {
                print("Error: Invalid server response")
            }
            throw URLError(.badServerResponse)
        }
        // Assuming response like {"data": [Device]}
        struct DeviceResponse: Codable {
            let data: [Device]
        }
        let deviceResponse = try JSONDecoder().decode(DeviceResponse.self, from: data)
        return deviceResponse.data
    }
}
