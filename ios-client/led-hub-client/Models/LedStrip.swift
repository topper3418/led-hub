//
//  LedStrip.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/21/25.
//

import Foundation

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