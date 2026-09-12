import Foundation

struct BodyMeasurement: Identifiable, Codable {
    var id = UUID()
    var date: Date
    var weight: Double
    var bmi: Double
    var bodyFat: Double
    var fatMass: Double
    var muscleMass: Double
    var water: Double
    var bmr: Int
    var visceralFat: Int
}

struct WorkoutSet: Identifiable, Codable {
    var id = UUID()
    var weight: Double
    var reps: Int
}

struct Workout: Identifiable, Codable {
    var id = UUID()
    var date: Date
    var muscleGroup: String
    var exercise: String
    var sets: [WorkoutSet]
}

struct Meal: Identifiable, Codable {
    var id = UUID()
    var date: Date
    var name: String
    var details: String
    var calories: Int
    var protein: Int
    var carbs: Int
    var fat: Int
}
