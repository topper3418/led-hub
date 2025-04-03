//
//  Settings.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/30/25.
//

// TODO: integrate this with one more settings screen
import Foundation
// Storing the URL (e.g., from a settings screen)
func saveServerUrl(_ url: String) {
    UserDefaults.standard.set(url, forKey: "serverUrl")
    // Optional: Synchronize immediately if you want to ensure it's saved
    UserDefaults.standard.synchronize()
}

// Retrieving the URL (e.g., when your app needs it)
func getServerUrl() -> String {
    // Provide a default URL if none is set
    var url: String = UserDefaults.standard.string(forKey: "serverUrl") ?? "http://led-hub.local/"
    // make sure it ends with /
    if !url.hasSuffix("/") {
        url.append("/")
    }
    return url
}
