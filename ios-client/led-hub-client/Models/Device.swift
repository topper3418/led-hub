//
//  Device.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/21/25.
//

import Foundation

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