//
//  Room.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

import Foundation

struct RoomsResponse: Codable {
    let data: RoomsData
    
    struct RoomsData: Codable {
        let rooms: [Room]
    }
}

struct Room: Identifiable, Codable {
    let id: Int?
    var name: String
    var devices: [Device]?
    var on: Bool?
    var ledStrips: [LedStrip]?
        
    // Computed property to satisfy Identifiable
    var identifiableId: Int {
        id ?? 0 // Use 0 as fallback for nil (misc room)
    }
    
    enum CodingKeys: String, CodingKey {
        case id, name, devices
        case ledStrips = "led_strips"
    }
}

struct Device: Identifiable, Codable {
    let id: Int?
    var name: String?
    var mac: String?
    var lastPing: String?
    var roomId: Int? // Added
    var ledStrip: LedStrip?
    
    var identifiableId: Int {
        id ?? 0
    }
    
    enum CodingKeys: String, CodingKey {
        case id, name, mac
        case lastPing = "last_ping"
        case roomId = "room_id"
        case ledStrip = "led_strip"
    }
}

struct LedStrip: Codable {
    var on: Bool?
    var red: Int?
    var green: Int?
    var blue: Int?
    var brightness: Int?
    var numLeds: Int?
    var ledPin: Int?
    
    enum CodingKeys: String, CodingKey {
        case on, red, green, blue, brightness
        case numLeds = "num_leds"
        case ledPin = "led_pin"
    }
}
