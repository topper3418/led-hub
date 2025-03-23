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
        guard !isListening, speechRecognizer?.isAvailable ?? false else { return }
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            self.error = error
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { return }
        recognitionRequest.shouldReportPartialResults = true

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
            self.audioBuffers.append(buffer)  // Store audio packets
        }

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

    func sendAudioToEndpoint(buffers: [AVAudioPCMBuffer]) async {
        let url = URL(string: "http://opperudHome.local/api/command")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")

        // Convert buffers to raw data (simplified example)
        let audioData = buffers.compactMap { buffer in
            guard let floatChannelData = buffer.floatChannelData else { return nil }
            let frameLength = Int(buffer.frameLength)
            let channelCount = Int(buffer.format.channelCount)
            let dataSize = frameLength * channelCount * MemoryLayout<Float>.size
            return Data(bytes: floatChannelData[0], count: dataSize)
        }.reduce(Data(), +)

        do {
            let (_, response) = try await URLSession.shared.upload(for: request, from: audioData)
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                DispatchQueue.main.async {
                    self.error = URLError(.badServerResponse)
                }
                return
            }
            DispatchQueue.main.async {
                self.error = nil
            }
        } catch {
            DispatchQueue.main.async {
                self.error = error
            }
        }
    }
}
