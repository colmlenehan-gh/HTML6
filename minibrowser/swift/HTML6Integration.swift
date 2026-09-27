import Foundation
import WebKit

/// HTML6 integration for a MiniBrowser built on WKWebView.
///
/// Inject this user script into the WKUserContentController before creating
/// the WKWebView. The runtime is loaded at document start so HTML6 pages can
/// initialize as early as possible.
enum HTML6Integration {
    static let runtimeResource = "html6"
    static let runtimeExtension = "js"

    static func runtimeSource(bundle: Bundle = .main) -> String {
        guard let url = bundle.url(forResource: runtimeResource, withExtension: runtimeExtension),
              let source = try? String(contentsOf: url, encoding: .utf8) else {
            assertionFailure("html6.js was not found in the application bundle")
            return ""
        }
        return source
    }

    static func install(into controller: WKUserContentController,
                        bundle: Bundle = .main) {
        let source = runtimeSource(bundle: bundle)
        guard !source.isEmpty else { return }

        let script = WKUserScript(
            source: source,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )

        controller.addUserScript(script)
    }
}

/// Converts the experimental HTML6 doctype into the standards HTML doctype
/// before WebKit sees the document. This avoids WebKit entering quirks mode.
enum HTML6Preprocessor {
    static func prepare(_ source: String) -> String {
        let pattern = #"(?is)<!doctype\s+html6\s*>"#
        guard let regex = try? NSRegularExpression(pattern: pattern) else {
            return source
        }

        let range = NSRange(source.startIndex..<source.endIndex, in: source)
        return regex.stringByReplacingMatches(
            in: source,
            options: [],
            range: range,
            withTemplate: "<!doctype html>"
        )
    }
}
