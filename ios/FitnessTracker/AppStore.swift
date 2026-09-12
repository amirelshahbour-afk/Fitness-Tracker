import Foundation

@MainActor
final class AppStore: ObservableObject {
    @Published var measurements: [BodyMeasurement] = [] { didSet { save() } }
    @Published var workouts: [Workout] = [] { didSet { save() } }
    @Published var meals: [Meal] = [] { didSet { save() } }
    @Published var goalWeight: Double = 70 { didSet { save() } }

    private let key = "fitnessTracker.native.v1"
    private var loading = true

    init() {
        load()
        loading = false
        if measurements.isEmpty { seed() }
    }

    var latest: BodyMeasurement? { measurements.sorted { $0.date < $1.date }.last }

    private struct Snapshot: Codable {
        var measurements: [BodyMeasurement]
        var workouts: [Workout]
        var meals: [Meal]
        var goalWeight: Double
    }

    private func save() {
        guard !loading else { return }
        let value = Snapshot(measurements: measurements, workouts: workouts, meals: meals, goalWeight: goalWeight)
        if let encoded = try? JSONEncoder().encode(value) { UserDefaults.standard.set(encoded, forKey: key) }
    }

    private func load() {
        guard let raw = UserDefaults.standard.data(forKey: key), let value = try? JSONDecoder().decode(Snapshot.self, from: raw) else { return }
        measurements = value.measurements; workouts = value.workouts; meals = value.meals; goalWeight = value.goalWeight
    }

    private func date(_ text: String) -> Date {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; return f.date(from: text) ?? .now
    }

    private func seed() {
        measurements = [
            .init(date: date("2026-09-04"), weight: 84.6, bmi: 27.6, bodyFat: 24.1, fatMass: 20.4, muscleMass: 49.2, water: 54.9, bmr: 1652, visceralFat: 10),
            .init(date: date("2026-09-11"), weight: 84.0, bmi: 27.4, bodyFat: 24.1, fatMass: 20.2, muscleMass: 48.5, water: 54.9, bmr: 1639, visceralFat: 10)
        ]
    }
}
