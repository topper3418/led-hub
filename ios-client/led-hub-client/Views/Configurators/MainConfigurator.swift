//
//  MainConfigurator.swift
//  led-hub-client
//
//  Created by Travis Opperud on 3/30/25.
//

import SwiftUI

struct MainConfiguratorView: View {
    @Environment(\.dismiss) var dismiss
    @State private var url: String = getServerUrl()
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack {
            Text("Configure Server")
                .font(.title)
                .foregroundColor(.primary)
            Text("This currently does nothing, just so you know")
            TextField("Server address", text: $url)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .foregroundColor(.primary)
                .padding()
            Spacer()
            Button("Save") {
                save()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(Color(.systemBackground))
    }
    
    private func save() {
        saveServerUrl(url)
        dismiss()
    }
}

#Preview {
    MainConfiguratorView()
}
