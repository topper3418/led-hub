//
//  APIService.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

import Foundation

class APIService: ObservableObject {
    private let baseURL = "http://opperudHome.local/api/"
    
    func fetchRooms() async throws -> [Room] {
        let urlString = "\(baseURL)rooms"
        guard let url = URL(string: urlString) else {
            print("Invalid URL: \(urlString)")
            throw URLError(.badURL)
        }
        print("Fetching rooms from: \(url)")
        
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse else {
            print("Invalid response")
            throw URLError(.badServerResponse)
        }
        print("Response status code: \(httpResponse.statusCode)")
        
        if httpResponse.statusCode != 200 {
            print("Error: Server returned status code \(httpResponse.statusCode)")
            throw URLError(.badServerResponse)
        }
        if false {
            print("Raw data: \(String(data: data, encoding: .utf8) ?? "Unable to decode data")")
        }
        let roomsResponse = try JSONDecoder().decode(RoomsResponse.self, from: data)
        return roomsResponse.data.rooms
    }

    func fetchRoom(id: Int) async throws -> Room {
        let urlString = "\(baseURL)rooms/\(id)?include=led_strip_devices"
        guard let url = URL(string: urlString) else {
            print("Invalid URL: \(urlString)")
            throw URLError(.badURL)
        }
        print("Fetching room \(id) from: \(url)")
        
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse else {
            print("Invalid response")
            throw URLError(.badServerResponse)
        }
        print("Response status code: \(httpResponse.statusCode)")
        
        if httpResponse.statusCode != 200 {
            print("Error: Server returned status code \(httpResponse.statusCode)")
            throw URLError(.badServerResponse)
        }
        
        if false {
            print("Raw data: \(String(data: data, encoding: .utf8) ?? "Unable to decode data")")
        }
        struct RoomResponse: Codable {
            let data: RoomData
            struct RoomData: Codable {
                let room: Room
            }
        }
        let roomResponse = try JSONDecoder().decode(RoomResponse.self, from: data)
        return roomResponse.data.room
    }
    
    func updateRoom(_ room: Room) async throws {
        let roomId = room.id ?? 0
        let url = URL(string: "\(baseURL)rooms/\(roomId)/led_strips")!
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(room)
        let (_, _) = try await URLSession.shared.data(for: request)
    }
    
    func updateLedStrips(roomId: Int, on: Bool) async throws {
        let url = URL(string: "\(baseURL)rooms/\(roomId)/led_strips")!
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Define a nested payload structure
        struct LedStripUpdateData: Codable {
            let on: Bool?
        }
        struct LedStripUpdate: Codable {
            let data: LedStripUpdateData
        }
        let payload = LedStripUpdate(data: LedStripUpdateData(on: on))
        print("submitting put request with payload: \(payload)")
        request.httpBody = try JSONEncoder().encode(payload)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            print("Failed to update LED strips: \(String(data: data, encoding: .utf8) ?? "No response data")")
            throw URLError(.badServerResponse)
        }
    }
    
    func deleteRoom(id: Int) async throws {
        let url = URL(string: "\(baseURL)rooms/\(id)")!
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        let (_, _) = try await URLSession.shared.data(for: request)
    }
    
    func addRoom() async throws -> Room {
        let url = URL(string: "\(baseURL)rooms")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode([String: String]())
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(Room.self, from: data)
    }
}
