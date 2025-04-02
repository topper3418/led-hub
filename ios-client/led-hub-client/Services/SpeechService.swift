//
//  SpeechService.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/22/25.
//

import Speech
import AVFoundation

class SpeechService: ObservableObject {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    private var audioBuffers: [AVAudioPCMBuffer] = []  // Store audio packets

    @Published var recognizedText: String = ""
    @Published var isListening: Bool = false
    @Published var error: Error?
    @Published var message: String = ""

    func requestPermissions() {
        SFSpeechRecognizer.requestAuthorization { authStatus in
            DispatchQueue.main.async {
                if authStatus != .authorized {
                    self.error = NSError(domain: "Speech", code: -1, userInfo: [NSLocalizedDescriptionKey: "Speech recognition not authorized"])
                }
            }
        }

        // Updated for iOS 17+
        AVAudioApplication.requestRecordPermission { granted in
            DispatchQueue.main.async {
                if !granted {
                    self.error = NSError(domain: "Audio", code: -1, userInfo: [NSLocalizedDescriptionKey: "Microphone access denied"])
                }
            }
        }
    }

    func startListening() {
        print("starting to listen")
        guard !isListening, speechRecognizer?.isAvailable ?? false else { return }
        
        let audioSession = AVAudioSession.sharedInstance()
        print("audio session created")
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            self.error = error
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        print("recognition request created")
        guard let recognitionRequest = recognitionRequest else { return }
        recognitionRequest.shouldReportPartialResults = true

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
            self.audioBuffers.append(buffer)  // Store audio packets
        }
        print("tap installed")

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            self.error = error
            return
        }

        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { result, error in
            DispatchQueue.main.async {
                if let result = result {
                    self.recognizedText = result.bestTranscription.formattedString
                }
                if let error = error {
                    self.error = error
                    let _ = self.stopListening()
                }
            }
        }
        
        DispatchQueue.main.async {
            self.isListening = true
            self.error = nil
            self.audioBuffers = []  // Reset buffers
        }
    }

    func stopListening() -> [AVAudioPCMBuffer] {
        guard isListening else { return [] }
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionTask = nil
        recognitionRequest = nil
        
        do {
            try AVAudioSession.sharedInstance().setActive(false)
        } catch {
            self.error = error
        }
        
        DispatchQueue.main.async {
            self.isListening = false
        }
        return audioBuffers  // Return captured audio packets
    }

    func sendAudioToEndpoint() async {
        print("sending command")
        let url = URL(string: getServerUrl() + "command")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let commandData: [String: [String: String]] = [
            "data": [
                "command": recognizedText
            ]
        ]
        guard let jsonData = try? JSONSerialization.data(withJSONObject: commandData) else {
            Task { @MainActor in
                self.error = NSError(domain: "JSON", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode command"])
                self.message = "Error encoding command"
            }
            return
        }
        print("Command payload: \(String(data: jsonData, encoding: .utf8) ?? "Invalid JSON")")

        do {
            print("Starting upload to \(url)")
            let (_, response) = try await URLSession.shared.upload(for: request, from: jsonData)
            print("Response received: \(response)")
            guard let httpResponse = response as? HTTPURLResponse else {
                print("Not an HTTP response")
                Task { @MainActor in
                    self.error = URLError(.badServerResponse)
                    self.message = "Error: Invalid server response"
                }
                return
            }
            print("Status code: \(httpResponse.statusCode)")
            guard httpResponse.statusCode == 200 else {
                print("Server error: \(httpResponse.statusCode)")
                Task { @MainActor in
                    self.error = URLError(.badServerResponse)
                    self.message = "Error: Server returned \(httpResponse.statusCode)"
                }
                return
            }
            Task { @MainActor in
                self.error = nil
                self.recognizedText = ""
                self.message = "Command sent successfully: \(self.recognizedText)"
                try await Task.sleep(nanoseconds: 2_000_000_000)
                await MainActor.run {
                    self.message = ""
                }
            }
        } catch {
            print("Upload failed with error: \(error.localizedDescription)")
            Task { @MainActor in
                self.error = error
                self.message = "Error sending command: \(error.localizedDescription)"
            }
        }
    }
}
