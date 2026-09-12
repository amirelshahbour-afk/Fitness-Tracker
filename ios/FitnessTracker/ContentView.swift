import SwiftUI
import Charts

struct ContentView: View {
    var body: some View {
        TabView {
            DashboardView().tabItem { Label("الرئيسية", systemImage: "house.fill") }
            WorkoutsView().tabItem { Label("التمارين", systemImage: "dumbbell.fill") }
            NutritionView().tabItem { Label("التغذية", systemImage: "fork.knife") }
            MeasurementsView().tabItem { Label("القياسات", systemImage: "chart.line.uptrend.xyaxis") }
        }
        .tint(.teal)
    }
}

struct DashboardView: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    if let m = store.latest {
                        HStack {
                            VStack(alignment: .leading, spacing: 5) {
                                Text("آخر قياس").font(.caption).foregroundStyle(.secondary)
                                Text(m.weight, format: .number.precision(.fractionLength(1))).font(.system(size: 38, weight: .bold)) + Text(" كجم").font(.title3)
                                Text(m.date.formatted(date: .abbreviated, time: .omitted)).foregroundStyle(.secondary)
                            }
                            Spacer()
                            VStack { Text("الهدف").font(.caption); Text("\(store.goalWeight, specifier: "%.0f")").font(.title.bold()); Text("كجم").font(.caption) }
                                .frame(width: 92, height: 92).background(.teal.opacity(0.12), in: Circle())
                        }.card()

                        LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
                            Metric(title: "BMI", value: String(format: "%.1f", m.bmi), icon: "figure")
                            Metric(title: "دهون الجسم", value: String(format: "%.1f%%", m.bodyFat), icon: "percent")
                            Metric(title: "وزن العضلات", value: String(format: "%.1f كجم", m.muscleMass), icon: "figure.strengthtraining.traditional")
                            Metric(title: "الماء", value: String(format: "%.1f%%", m.water), icon: "drop.fill")
                            Metric(title: "BMR", value: "\(m.bmr) kcal", icon: "flame.fill")
                            Metric(title: "الدهون الحشوية", value: "\(m.visceralFat)", icon: "heart.fill")
                        }
                        VStack(alignment: .leading) {
                            Text("تطور الوزن").font(.headline)
                            Chart(store.measurements.sorted { $0.date < $1.date }) { item in
                                LineMark(x: .value("التاريخ", item.date), y: .value("الوزن", item.weight)).foregroundStyle(.teal)
                                PointMark(x: .value("التاريخ", item.date), y: .value("الوزن", item.weight)).foregroundStyle(.teal)
                            }.frame(height: 190)
                        }.card()
                    }
                }.padding()
            }.navigationTitle("Fitness Tracker")
        }
    }
}

struct Metric: View {
    let title: String, value: String, icon: String
    var body: some View { VStack(alignment: .leading, spacing: 10) { Image(systemName: icon).foregroundStyle(.teal); Text(title).font(.caption).foregroundStyle(.secondary); Text(value).font(.title3.bold()) }.frame(maxWidth: .infinity, alignment: .leading).card() }
}

struct WorkoutsView: View {
    @EnvironmentObject var store: AppStore
    @State private var showAdd = false
    var body: some View {
        NavigationStack {
            List { ForEach(store.workouts.sorted { $0.date > $1.date }) { w in Section("\(w.muscleGroup) · \(w.date.formatted(date: .abbreviated, time: .omitted))") { VStack(alignment: .leading, spacing: 8) { Text(w.exercise).font(.headline); ForEach(Array(w.sets.enumerated()), id: \.element.id) { i,s in Text("مجموعة \(i+1): \(s.weight, specifier: "%.1f") كجم × \(s.reps)").foregroundStyle(.secondary) } } } } }
            .navigationTitle("التمارين").toolbar { Button { showAdd = true } label: { Image(systemName: "plus") } }.sheet(isPresented: $showAdd) { AddWorkoutView() }
        }
    }
}

struct AddWorkoutView: View {
    @EnvironmentObject var store: AppStore; @Environment(\.dismiss) var dismiss
    @State var group=""; @State var exercise=""; @State var w1=""; @State var r1=""; @State var w2=""; @State var r2=""; @State var w3=""; @State var r3=""
    var body: some View { NavigationStack { Form { TextField("المجموعة العضلية", text:$group); TextField("التمرين",text:$exercise); ForEach(1...3,id:\.self){i in HStack { TextField("وزن \(i)",text:i==1 ? $w1 : i==2 ? $w2 : $w3).keyboardType(.decimalPad); TextField("عدات",text:i==1 ? $r1 : i==2 ? $r2 : $r3).keyboardType(.numberPad) } } } .navigationTitle("تمرين جديد").toolbar { ToolbarItem(placement:.confirmationAction){Button("حفظ"){ let pairs=[(w1,r1),(w2,r2),(w3,r3)]; store.workouts.append(.init(date:.now,muscleGroup:group,exercise:exercise,sets:pairs.map{.init(weight:Double($0.0) ?? 0,reps:Int($0.1) ?? 0)})); dismiss() }}; ToolbarItem(placement:.cancellationAction){Button("إلغاء"){dismiss()}} } } }
}

struct NutritionView: View {
    @EnvironmentObject var store: AppStore; @State private var showAdd=false
    var today:[Meal]{store.meals.filter{Calendar.current.isDateInToday($0.date)}}
    var body: some View { NavigationStack { List { Section("ملخص اليوم") { HStack { Macro(name:"السعرات",value:today.reduce(0){$0+$1.calories}); Macro(name:"البروتين",value:today.reduce(0){$0+$1.protein}); Macro(name:"الكارب",value:today.reduce(0){$0+$1.carbs}); Macro(name:"الدهون",value:today.reduce(0){$0+$1.fat}) } } Section("الوجبات") { ForEach(today){m in VStack(alignment:.leading){Text(m.name).font(.headline);Text(m.details).foregroundStyle(.secondary);Text("\(m.calories) kcal · P \(m.protein)g · C \(m.carbs)g · F \(m.fat)g").font(.caption)} } } }.navigationTitle("التغذية").toolbar{Button{showAdd=true}label:{Image(systemName:"plus")}}.sheet(isPresented:$showAdd){AddMealView()} } }
}
struct Macro:View{let name:String;let value:Int;var body:some View{VStack{Text("\(value)").font(.headline);Text(name).font(.caption2).foregroundStyle(.secondary)}.frame(maxWidth:.infinity)}}
struct AddMealView:View{@EnvironmentObject var store:AppStore;@Environment(\.dismiss)var dismiss;@State var name="";@State var details="";@State var calories="";@State var protein="";@State var carbs="";@State var fat="";var body:some View{NavigationStack{Form{TextField("اسم الوجبة",text:$name);TextField("المكونات",text:$details);TextField("السعرات",text:$calories).keyboardType(.numberPad);TextField("البروتين",text:$protein).keyboardType(.numberPad);TextField("الكارب",text:$carbs).keyboardType(.numberPad);TextField("الدهون",text:$fat).keyboardType(.numberPad)}.navigationTitle("إضافة وجبة").toolbar{ToolbarItem(placement:.confirmationAction){Button("حفظ"){store.meals.append(.init(date:.now,name:name,details:details,calories:Int(calories) ?? 0,protein:Int(protein) ?? 0,carbs:Int(carbs) ?? 0,fat:Int(fat) ?? 0));dismiss()}};ToolbarItem(placement:.cancellationAction){Button("إلغاء"){dismiss()}}}}}}

struct MeasurementsView: View {
    @EnvironmentObject var store: AppStore; @State private var showAdd=false
    var body: some View { NavigationStack { List { ForEach(store.measurements.sorted{$0.date>$1.date}){m in VStack(alignment:.leading,spacing:6){Text("\(m.weight,specifier:"%.1f") كجم").font(.title3.bold());Text(m.date.formatted(date:.long,time:.omitted)).foregroundStyle(.secondary);Text("BMI \(m.bmi,specifier:"%.1f") · دهون \(m.bodyFat,specifier:"%.1f")% · عضلات \(m.muscleMass,specifier:"%.1f") كجم").font(.caption)} } }.navigationTitle("قياسات الجسم").toolbar{Button{showAdd=true}label:{Image(systemName:"plus")}}.sheet(isPresented:$showAdd){AddMeasurementView()} } }
}
struct AddMeasurementView:View{@EnvironmentObject var store:AppStore;@Environment(\.dismiss)var dismiss;@State var weight="";@State var bmi="";@State var bodyFat="";@State var muscle="";@State var water="";@State var bmr="";@State var visceral="";var body:some View{NavigationStack{Form{TextField("الوزن",text:$weight).keyboardType(.decimalPad);TextField("BMI",text:$bmi).keyboardType(.decimalPad);TextField("دهون الجسم %",text:$bodyFat).keyboardType(.decimalPad);TextField("وزن العضلات",text:$muscle).keyboardType(.decimalPad);TextField("الماء %",text:$water).keyboardType(.decimalPad);TextField("BMR",text:$bmr).keyboardType(.numberPad);TextField("دهون حشوية",text:$visceral).keyboardType(.numberPad)}.navigationTitle("قياس جديد").toolbar{ToolbarItem(placement:.confirmationAction){Button("حفظ"){let w=Double(weight) ?? 0;let bf=Double(bodyFat) ?? 0;store.measurements.append(.init(date:.now,weight:w,bmi:Double(bmi) ?? 0,bodyFat:bf,fatMass:w*bf/100,muscleMass:Double(muscle) ?? 0,water:Double(water) ?? 0,bmr:Int(bmr) ?? 0,visceralFat:Int(visceral) ?? 0));dismiss()}};ToolbarItem(placement:.cancellationAction){Button("إلغاء"){dismiss()}}}}}}

extension View { func card() -> some View { self.padding(16).background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 20, style: .continuous)) } }
