# Fitness Tracker — Private iPhone App

Native SwiftUI version of Fitness Tracker. All fitness, nutrition, and body-composition data is stored locally on the iPhone with UserDefaults; no public web deployment is required.

## Requirements
- macOS with Xcode 16 or later
- iOS 17+
- Apple ID for personal signing (or Apple Developer membership)

## Create the Xcode project
1. In Xcode choose **File > New > Project > iOS App**.
2. Product Name: `FitnessTracker`.
3. Interface: SwiftUI, Language: Swift.
4. Set a unique bundle identifier such as `com.amir.fitnesstracker`.
5. Replace the generated Swift files with the files in `ios/FitnessTracker/`.
6. Set the deployment target to iOS 17 or later.
7. In **Signing & Capabilities**, select your Apple account/team.
8. Connect the iPhone, select it as the run destination, and press Run.

The repository can remain private. No GitHub Pages deployment is needed.
