import Foundation
import WebKit

enum HTML6DemoLoader {
    static func loadDemo(into webView: WKWebView) {
        guard let htmlURL = Bundle.main.url(
            forResource: "index",
            withExtension: "html",
            subdirectory: "html6-demo"
        ) else {
            assertionFailure("HTML6 demo was not bundled")
            return
        }

        do {
            let source = try String(contentsOf: htmlURL, encoding: .utf8)
            let normalized = HTML6Preprocessor.prepare(source)

            let baseURL = htmlURL.deletingLastPathComponent()
            webView.loadHTMLString(normalized, baseURL: baseURL)
        } catch {
            print("HTML6 demo load failed: \(error)")
        }
    }
}
