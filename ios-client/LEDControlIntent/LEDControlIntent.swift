//
//  LEDControlIntent.swift
//  LEDControlIntent
//
//  Created by Travis Opperud on 3/30/25.
//

import AppIntents

struct LEDControlIntent: AppIntent {
    
    static let title: LocalizedStringResource = "Send Command to Hub"
    
    static let description = IntentDescription("Sends a plain speech command to the hub")
    
    @Parameter(title: "Command")
    var command: String
    
    func perform() async throws -> some IntentResult {
        try await sendCommandToServer(commandIn: command)
        return .result()
    }
    
    private func sendCommandToServer(commandIn: String) async throws {
        let url = URL(string: getServerUrl() + "command")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let commandData: [String: [String: String]] = ["data": ["command": commandIn]]
        let jsonData = try JSONSerialization.data(withJSONObject: commandData)
        request.httpBody = jsonData
        
        print("Command payload: \(String(data: jsonData, encoding: .utf8) ?? "Invalid JSON")")
        print("Starting upload to \(url)")
        
        let (data, response) = try await URLSession.shared.upload(for: request, from: jsonData)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            print("Server error: \(String(data: data, encoding: .utf8) ?? "No response data")")
            throw URLError(.badServerResponse)
        }
        print("Command sent successfully: \(commandIn)")
    }
}
