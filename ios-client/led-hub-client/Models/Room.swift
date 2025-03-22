//
//  Room.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/16/25.
//

import Foundation


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


