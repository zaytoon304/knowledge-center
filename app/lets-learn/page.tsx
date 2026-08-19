"use client";
import { useState } from "react";
import { Lightbulb, ChevronRight, Wrench, ListOrdered, Code2, Sparkles, ExternalLink, Info } from "lucide-react";

interface Lesson {
  id: string;
  emoji: string;
  title: string;
  image: string;
  level: "ابتدائي" | "متوسط" | "متقدم";
  intro: string;
  tools: string[];
  steps: string[];
  code: string;
  tip?: string;
}

const LESSONS: Lesson[] = [
  {
    id: "blink",
    emoji: "💡",
    title: "الوميض (Blink)",
    image: "/learn/led-blink.jpg",
    level: "ابتدائي",
    intro: "أول درس يتعلمه أي شخص بعالم الأردوينو! هنخلي لمبة LED واحدة تضيء وتنطفئ بالتبادل — أبسط برنامج ممكن، وأساس كل شي جاي بعده.",
    tools: ["لوحة أردوينو أونو", "لمبة LED", "مقاومة 220 أوم", "سلكين توصيل", "لوحة تجارب (اختياري)"],
    steps: [
      "وصّل رجل LED الطويلة (+) بالمنفذ الرقمي 13 عبر مقاومة 220 أوم.",
      "وصّل رجل LED القصيرة (-) بمنفذ GND.",
      "ارفع الكود بالأسفل على اللوحة.",
      "راقب اللمبة — تضيء ثانية، تنطفئ ثانية، وتتكرر.",
    ],
    code: `// درس: الوميض (Blink) — أول برنامج بالأردوينو
// اللمبة المدمجة بمعظم لوحات الأردوينو موصولة أصلاً بالمنفذ رقم 13

void setup() {
  pinMode(13, OUTPUT); // نجهّز المنفذ ليكون مخرج (Output)
}

void loop() {
  digitalWrite(13, HIGH); // نشعل اللمبة
  delay(1000);             // ننتظر ثانية كاملة
  digitalWrite(13, LOW);  // نطفئ اللمبة
  delay(1000);             // ننتظر ثانية كاملة
}`,
    tip: "جرّب تغيّر رقم 1000 إلى 200 — شوف اللمبة تومض أسرع!",
  },
  {
    id: "two-leds",
    emoji: "✨",
    title: "ليدان (Two LEDs)",
    image: "/learn/led-blink.jpg",
    level: "ابتدائي",
    intro: "الخطوة اللي بعد الوميض: لمبتان تضيئان بالتبادل — وحدة تنطفئ لما الثانية تضيء. أول خطوة للتحكم بأكثر من قطعة بنفس الوقت.",
    tools: ["لوحة أردوينو أونو", "لمبتا LED", "مقاومتين 220 أوم", "لوحة تجارب", "أسلاك توصيل"],
    steps: [
      "وصّل اللمبة الأولى بالمنفذ الرقمي 8 (عبر مقاومة).",
      "وصّل اللمبة الثانية بالمنفذ الرقمي 9 (عبر مقاومة).",
      "وصّل رجل كل لمبة القصيرة بـ GND.",
      "ارفع الكود وراقب اللمبتين تتبادلان الإضاءة.",
    ],
    code: `// درس: ليدان (Two LEDs) — لمبتان تومضان بالتبادل
const int led1 = 8;
const int led2 = 9;

void setup() {
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
}

void loop() {
  digitalWrite(led1, HIGH);
  digitalWrite(led2, LOW);
  delay(500);
  digitalWrite(led1, LOW);
  digitalWrite(led2, HIGH);
  delay(500);
}`,
  },
  {
    id: "traffic-light",
    emoji: "🚦",
    title: "إشارة المرور",
    image: "/learn/traffic-light.jpg",
    level: "ابتدائي",
    intro: "نبني إشارة مرور حقيقية بثلاث لمبات (أحمر، أصفر، أخضر) بنفس توقيت الإشارات الحقيقية بالشارع.",
    tools: ["لوحة أردوينو أونو", "3 لمبات LED (أحمر، أصفر، أخضر)", "3 مقاومات 220 أوم", "لوحة تجارب", "أسلاك توصيل"],
    steps: [
      "وصّل اللمبة الحمراء بالمنفذ 8، الصفراء بالمنفذ 9، الخضراء بالمنفذ 10 (كل وحدة عبر مقاومة).",
      "وصّل كل الأرجل القصيرة بـ GND.",
      "ارفع الكود — الأخضر يضيء فترة طويلة، الأصفر فترة قصيرة، ثم الأحمر فترة طويلة، وتتكرر الدورة.",
    ],
    code: `// درس: إشارة المرور — محاكاة إشارة حقيقية بثلاث لمبات
const int red = 8, yellow = 9, green = 10;

void setup() {
  pinMode(red, OUTPUT);
  pinMode(yellow, OUTPUT);
  pinMode(green, OUTPUT);
}

void loop() {
  digitalWrite(green, HIGH);
  delay(4000);
  digitalWrite(green, LOW);

  digitalWrite(yellow, HIGH);
  delay(1000);
  digitalWrite(yellow, LOW);

  digitalWrite(red, HIGH);
  delay(4000);
  digitalWrite(red, LOW);
}`,
  },
  {
    id: "police-lights",
    emoji: "🚓",
    title: "أضواء سيارة الشرطة",
    image: "/learn/police-lights.jpg",
    level: "ابتدائي",
    intro: "لمبتان (أحمر وأزرق) تومضان بسرعة بالتبادل — نفس تأثير أضواء سيارات الطوارئ.",
    tools: ["لوحة أردوينو أونو", "لمبة LED حمراء", "لمبة LED زرقاء", "مقاومتين 220 أوم", "لوحة تجارب"],
    steps: [
      "وصّل اللمبة الحمراء بالمنفذ 8 والزرقاء بالمنفذ 9 (كل وحدة عبر مقاومة).",
      "وصّل الأرجل القصيرة بـ GND.",
      "ارفع الكود — كل لون يومض عدة ومضات سريعة قبل ما يجي دور اللون الثاني.",
    ],
    code: `// درس: أضواء سيارة الشرطة — لمبتان تومضان بسرعة بالتبادل
const int redLight = 8;
const int blueLight = 9;

void setup() {
  pinMode(redLight, OUTPUT);
  pinMode(blueLight, OUTPUT);
}

void loop() {
  for (int i = 0; i < 5; i++) {   // 5 ومضات سريعة للأحمر
    digitalWrite(redLight, HIGH);
    delay(80);
    digitalWrite(redLight, LOW);
    delay(80);
  }
  for (int i = 0; i < 5; i++) {   // 5 ومضات سريعة للأزرق
    digitalWrite(blueLight, HIGH);
    delay(80);
    digitalWrite(blueLight, LOW);
    delay(80);
  }
}`,
  },
  {
    id: "water-sensor",
    emoji: "💧",
    title: "حساس الماء",
    image: "/learn/water-sensor.jpg",
    level: "متوسط",
    intro: "حساس يكتشف وجود الماء أو تسرّبه — أساس أي مشروع إنذار غرق أو تسرّب مياه.",
    tools: ["لوحة أردوينو أونو", "وحدة حساس الماء", "لمبة LED (للتنبيه)", "مقاومة 220 أوم", "أسلاك توصيل"],
    steps: [
      "وصّل طرفي التغذية بالحساس (+ و -) بـ 5V و GND.",
      "وصّل طرف الإشارة (S) بالمنفذ التناظري A0.",
      "وصّل لمبة التنبيه بالمنفذ الرقمي 8.",
      "ارفع الكود، وجرّب تلمس لوحة الحساس بقطرة ماء — تشتعل اللمبة فوراً.",
    ],
    code: `// درس: حساس الماء — يكتشف وجود الماء أو التسرّب
const int waterSensor = A0;
const int alertLed = 8;
const int threshold = 300; // عدّلها حسب حساسية الحساس عندك

void setup() {
  pinMode(alertLed, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int level = analogRead(waterSensor);
  Serial.print("مستوى الماء: ");
  Serial.println(level);

  if (level > threshold) {
    digitalWrite(alertLed, HIGH); // فيه ماء — نشعل التحذير
  } else {
    digitalWrite(alertLed, LOW);
  }
  delay(300);
}`,
  },
  {
    id: "rain-sensor",
    emoji: "🌧️",
    title: "حساس المطر",
    image: "/learn/rain-sensor.jpg",
    level: "متوسط",
    intro: "حساس يكتشف سقوط الأمطار عبر لوحة معدنية تتغيّر مقاومتها لما تبتل — يُستخدم بأنظمة الإنذار المبكر.",
    tools: ["لوحة أردوينو أونو", "وحدة حساس المطر (بلوحتين)", "بازر أو لمبة LED", "أسلاك توصيل"],
    steps: [
      "وصّل لوحة الاستشعار بوحدة التحكم (LM393) حسب الأسلاك المرفقة معها.",
      "وصّل التغذية بـ 5V و GND، وطرف الخرج الرقمي (D0) بالمنفذ 7.",
      "وصّل البازر أو اللمبة بالمنفذ 8.",
      "ارفع الكود — عند سقوط قطرات ماء على اللوحة يعمل التنبيه تلقائياً.",
    ],
    code: `// درس: حساس المطر — يكتشف سقوط الأمطار
const int rainSensor = 7; // المخرج الرقمي D0 بوحدة الحساس
const int buzzer = 8;

void setup() {
  pinMode(rainSensor, INPUT);
  pinMode(buzzer, OUTPUT);
}

void loop() {
  int raining = digitalRead(rainSensor); // LOW = فيه مطر (بأغلب الوحدات)
  if (raining == LOW) {
    digitalWrite(buzzer, HIGH); // تنبيه: فيه مطر
  } else {
    digitalWrite(buzzer, LOW);
  }
  delay(200);
}`,
  },
  {
    id: "dht11",
    emoji: "🌡️",
    title: "حساس الرطوبة والحرارة DHT11",
    image: "/learn/dht11.jpg",
    level: "متوسط",
    intro: "حساس يقرأ درجة الحرارة والرطوبة بنفس اللحظة — نقطة بداية ممتازة لأي مشروع بيئي أو زراعي.",
    tools: ["لوحة أردوينو أونو", "حساس DHT11", "مقاومة 10 كيلو أوم (Pull-up)", "مكتبة DHT sensor library من Adafruit"],
    steps: [
      "وصّل طرف VCC بـ 5V وطرف GND بـ GND.",
      "وصّل طرف البيانات (Data) بالمنفذ الرقمي 2.",
      "ثبّت مكتبة \"DHT sensor library\" من Library Manager بالأردوينو IDE.",
      "ارفع الكود وافتح Serial Monitor لمشاهدة القراءات كل ثانيتين.",
    ],
    code: `// درس: قراءة حساس الحرارة والرطوبة DHT11
// المكتبة المطلوبة: "DHT sensor library" من Adafruit
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000); // الحساس يحتاج ثانيتين بين كل قراءة وأخرى

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("فشل في قراءة الحساس! تأكد من التوصيل");
    return;
  }

  Serial.print("الرطوبة: ");
  Serial.print(humidity);
  Serial.print(" %\\t");
  Serial.print("الحرارة: ");
  Serial.print(temperature);
  Serial.println(" °C");
}`,
  },
  {
    id: "hcsr04",
    emoji: "📏",
    title: "حساس الألتراسونيك HC-SR04",
    image: "/learn/hcsr04.jpg",
    level: "متوسط",
    intro: "حساس يقيس المسافة بإرسال موجة صوتية فوق سمعية وحساب الوقت اللي ترجع فيه — أساس أي مشروع تفادي عوائق أو إنذار اقتراب.",
    tools: ["لوحة أردوينو أونو", "حساس HC-SR04", "أسلاك توصيل"],
    steps: [
      "وصّل VCC بـ 5V و GND بـ GND.",
      "وصّل Trig بالمنفذ الرقمي 9 و Echo بالمنفذ الرقمي 10.",
      "ارفع الكود وافتح Serial Monitor — حرّك يدك أمام الحساس وشاهد المسافة تتغيّر.",
    ],
    code: `// درس: قياس المسافة بحساس الألتراسونيك HC-SR04
const int trigPin = 9;
const int echoPin = 10;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2; // تحويل زمن الصدى لمسافة بالسنتيمتر

  Serial.print("المسافة: ");
  Serial.print(distanceCm);
  Serial.println(" سم");
  delay(300);
}`,
  },
  {
    id: "pir",
    emoji: "🚶",
    title: "حساس الحركة PIR",
    image: "/learn/pir.jpg",
    level: "ابتدائي",
    intro: "حساس يكتشف حركة إنسان أو حيوان عبر الأشعة تحت الحمراء — أساس مشاريع الإنارة التلقائية وأنظمة الحماية.",
    tools: ["لوحة أردوينو أونو", "حساس PIR", "لمبة LED", "مقاومة 220 أوم"],
    steps: [
      "وصّل VCC بـ 5V و GND بـ GND.",
      "وصّل طرف الخرج (OUT) بالمنفذ الرقمي 7.",
      "وصّل لمبة LED بالمنفذ الرقمي 8.",
      "ارفع الكود — حرّك يدك أمام الحساس وشاهد اللمبة تشتعل.",
    ],
    code: `// درس: كاشف الحركة بحساس PIR
const int pirPin = 7;
const int ledPin = 8;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int motionDetected = digitalRead(pirPin);
  if (motionDetected == HIGH) {
    digitalWrite(ledPin, HIGH); // فيه حركة — نشعل اللمبة
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(100);
}`,
  },
  {
    id: "mq2",
    emoji: "🔥",
    title: "حساس الغاز والدخان MQ-2",
    image: "/learn/gas-sensor.jpg",
    level: "متوسط",
    intro: "حساس يقرأ مستوى الغاز أو الدخان بالهواء — أساس مشاريع السلامة والمطبخ الذكي.",
    tools: ["لوحة أردوينو أونو", "وحدة حساس MQ-2", "بازر إنذار", "أسلاك توصيل"],
    steps: [
      "وصّل VCC بـ 5V و GND بـ GND.",
      "وصّل الخرج التناظري (A0) بالمنفذ التناظري A0.",
      "وصّل البازر بالمنفذ الرقمي 8.",
      "ارفع الكود — إذا تجاوزت القراءة الحد المحدد يعمل البازر تلقائياً.",
    ],
    code: `// درس: كاشف الغاز والدخان MQ-2
const int gasSensor = A0;
const int buzzer = 8;
const int threshold = 400; // عدّلها حسب حساسية الحساس عندك

void setup() {
  pinMode(buzzer, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int gasLevel = analogRead(gasSensor);
  Serial.println(gasLevel);

  if (gasLevel > threshold) {
    digitalWrite(buzzer, HIGH); // تجاوز الحد الآمن — إنذار
  } else {
    digitalWrite(buzzer, LOW);
  }
  delay(300);
}`,
  },
  {
    id: "servo",
    emoji: "⚙️",
    title: "السيرفو موتور",
    image: "/learn/servo.jpg",
    level: "متوسط",
    intro: "محرك صغير يدور بزاوية محددة بالضبط (من 0 إلى 180 درجة) — أساس مشاريع الأذرع الروبوتية والأبواب الأوتوماتيكية.",
    tools: ["لوحة أردوينو أونو", "سيرفو موتور صغير (SG90)", "أسلاك توصيل"],
    steps: [
      "وصّل السلك الأحمر (+) بـ 5V.",
      "وصّل السلك الأسود/البني (-) بـ GND.",
      "وصّل سلك الإشارة (البرتقالي/الأصفر) بالمنفذ الرقمي 9.",
      "ارفع الكود — السيرفو يدور بين 0 و90 و180 درجة بالتتابع.",
    ],
    code: `// درس: السيرفو موتور — تحريكه بزوايا محددة
#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9); // سلك الإشارة موصول بالمنفذ 9
}

void loop() {
  myServo.write(0);    // يدور لزاوية 0 درجة
  delay(1000);
  myServo.write(90);   // يدور لمنتصف المدى
  delay(1000);
  myServo.write(180);  // يدور لأقصى زاوية
  delay(1000);
}`,
    tip: "سيرفو واحد صغير يشتغل من طاقة الأردوينو نفسه، لكن أكثر من سيرفو يحتاج مصدر طاقة خارجي منفصل.",
  },
  {
    id: "potentiometer",
    emoji: "🎚️",
    title: "المقاومة المتغيرة (Potentiometer)",
    image: "/learn/potentiometer.jpg",
    level: "ابتدائي",
    intro: "قطعة تدويرية تتحكم بقيمة متغيرة — نستخدمها هنا للتحكم بسطوع لمبة LED بلمسة يد.",
    tools: ["لوحة أردوينو أونو", "مقاومة متغيرة (بوتنشيومتر)", "لمبة LED", "مقاومة 220 أوم"],
    steps: [
      "وصّل طرفي المقاومة الجانبيين بـ 5V و GND.",
      "وصّل الطرف الأوسط (المتحرك) بالمنفذ التناظري A0.",
      "وصّل لمبة LED بمنفذ PWM رقم 9 (عبر مقاومة).",
      "ارفع الكود ودوّر المقبض — سطوع اللمبة يتغيّر تدريجياً.",
    ],
    code: `// درس: المقاومة المتغيرة — قراءة قيمة متغيرة والتحكم بسطوع LED
const int potPin = A0;
const int ledPin = 9; // منفذ PWM

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int potValue = analogRead(potPin);                 // قيمة من 0 إلى 1023
  int brightness = map(potValue, 0, 1023, 0, 255);   // نحوّلها لمدى سطوع اللمبة
  analogWrite(ledPin, brightness);
}`,
  },
  {
    id: "lcd1602",
    emoji: "🖥️",
    title: "شاشة LCD",
    image: "/learn/lcd1602.jpg",
    level: "متقدم",
    intro: "شاشة صغيرة تعرض نصوصاً بسطرين — رائعة لعرض رسائل ترحيب أو قراءات الحساسات مباشرة على المشروع.",
    tools: ["لوحة أردوينو أونو", "شاشة LCD 16×2 مع وحدة I2C", "مكتبة LiquidCrystal_I2C", "أسلاك توصيل"],
    steps: [
      "وصّل VCC بـ 5V و GND بـ GND.",
      "وصّل SDA بمنفذ SDA بالأردوينو (A4 غالباً) و SCL بمنفذ SCL (A5 غالباً).",
      "ثبّت مكتبة LiquidCrystal_I2C من Library Manager.",
      "ارفع الكود — النص يظهر على الشاشة فوراً.",
    ],
    code: `// درس: شاشة LCD — عرض نص عليها (بوحدة I2C)
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); // 0x27 هو العنوان الأشهر — غيّره لو الشاشة ما ظهرت

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("مرحباً بكم");
  lcd.setCursor(0, 1);
  lcd.print("مركز الابتكار");
}

void loop() {
  // النص ثابت هنا، وتقدر تغيّره حسب مشروعك
}`,
  },
  {
    id: "relay",
    emoji: "🔌",
    title: "وحدة الريلاي (Relay)",
    image: "/learn/relay.jpg",
    level: "متقدم",
    intro: "مفتاح كهربائي يتحكم فيه الأردوينو، يقدر يشغّل ويطفئ أجهزة بجهد أعلى بكثير من جهد الأردوينو (مثل مروحة أو مضخة ماء).",
    tools: ["لوحة أردوينو أونو", "وحدة ريلاي", "أسلاك توصيل"],
    steps: [
      "وصّل VCC بـ 5V و GND بـ GND.",
      "وصّل طرف الإشارة (IN) بالمنفذ الرقمي 8.",
      "⚠️ توصيل الجهاز الكهربائي بطرف الريلاي عالي الجهد يحتاج إشراف شخص كبير — لا تلمس الأطراف وهي موصولة بالكهرباء.",
    ],
    code: `// درس: وحدة الريلاي — التحكم بجهاز كهربائي عبر الأردوينو
const int relayPin = 8;

void setup() {
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, HIGH); // أغلب وحدات الريلاي تعمل بمنطق معكوس: HIGH = مطفأ
}

void loop() {
  digitalWrite(relayPin, LOW);  // تشغيل الجهاز المتصل
  delay(3000);
  digitalWrite(relayPin, HIGH); // إطفاء الجهاز
  delay(3000);
}`,
    tip: "⚠️ الجهد العالي خطر — هذا الدرس يحتاج إشراف مباشر من المعلم أو ولي الأمر.",
  },
  {
    id: "led-strip",
    emoji: "🌈",
    title: "شريط LED العنواني WS2812B",
    image: "/learn/led-strip.jpg",
    level: "متقدم",
    intro: "شريط فيه عشرات اللمبات، وكل لمبة نقدر نتحكم بلونها لحالها — نستخدمه هنا لعمل تأثير موجة ألوان متحركة.",
    tools: ["لوحة أردوينو أونو", "شريط LED عنواني WS2812B", "مكتبة FastLED", "مصدر طاقة مناسب لعدد اللمبات"],
    steps: [
      "وصّل GND بـ GND و 5V بمصدر الطاقة المناسب.",
      "وصّل سلك البيانات (Data In) بالمنفذ الرقمي 6.",
      "ثبّت مكتبة FastLED من Library Manager.",
      "ارفع الكود وشاهد تأثير الموجة الملونة يتحرك على طول الشريط.",
    ],
    code: `// درس: شريط LED العنواني WS2812B — تأثير موجة الألوان المتحركة
#include <FastLED.h>

#define LED_PIN 6
#define NUM_LEDS 8

CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
}

void loop() {
  for (int hue = 0; hue < 255; hue++) {
    for (int i = 0; i < NUM_LEDS; i++) {
      leds[i] = CHSV(hue + (i * 10), 255, 255); // كل لمبة بلون مختلف قليلاً
    }
    FastLED.show();
    delay(20);
  }
}`,
  },
];

const LEVEL_COLORS: Record<Lesson["level"], string> = {
  "ابتدائي": "bg-green-100 text-green-700",
  "متوسط": "bg-amber-100 text-amber-700",
  "متقدم": "bg-rose-100 text-rose-700",
};

export default function LetsLearnPage() {
  const [active, setActive] = useState<Lesson | null>(null);

  if (active) {
    return (
      <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
        <button onClick={() => setActive(null)} className="flex items-center gap-1.5 text-violet-700 font-semibold text-sm hover:text-violet-900">
          <ChevronRight className="w-4 h-4" /> كل الدروس
        </button>

        <div className="card overflow-hidden">
          <img src={active.image} alt={active.title} className="w-full h-56 object-cover" />
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{active.emoji}</span>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800">{active.title}</h1>
                <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[active.level]}`}>{active.level}</span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{active.intro}</p>

            <div>
              <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2"><Wrench className="w-4 h-4 text-violet-600" /> الأدوات المطلوبة</h3>
              <div className="flex flex-wrap gap-2">
                {active.tools.map(t => (
                  <span key={t} className="bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1.5 rounded-full text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2"><ListOrdered className="w-4 h-4 text-violet-600" /> خطوات التركيب</h3>
              <ol className="space-y-2">
                {active.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-2"><Code2 className="w-4 h-4 text-violet-600" /> الكود</h3>
              <pre dir="ltr" className="bg-gray-900 text-green-300 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed font-mono">{active.code}</pre>
            </div>

            {active.tip && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-sm text-amber-800">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" /> {active.tip}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-6 bg-gradient-to-l from-violet-800 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">هيا نتعلم</h1>
            <p className="text-indigo-200 text-sm">دروس تفاعلية بالصور: الأداة، طريقة التركيب، والكود — خطوة بخطوة</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-2 text-center mt-4 w-fit px-4">
          <span className="text-xl font-bold">{LESSONS.length}</span>
          <span className="text-indigo-200 text-xs mr-2">درس</span>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-gray-700 mb-1">جرّب الدروس بمحاكاة إلكترونية قبل التوصيل الحقيقي</h3>
        <p className="text-xs text-gray-400 mb-3">مواقع مجانية تفتح بصفحة جديدة — سجّل فيها بنفس البريد الإلكتروني اللي تستخدمه بهذه المنصة عشان تسهل عليك تتذكره.</p>
        <div className="flex flex-wrap gap-3">
          <a href="https://www.tinkercad.com/circuits" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-100">
            <ExternalLink className="w-4 h-4" /> Tinkercad
          </a>
          <a href="https://wokwi.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-100">
            <ExternalLink className="w-4 h-4" /> Wokwi
          </a>
        </div>
        <div className="flex items-start gap-2 mt-3 text-xs text-gray-400">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          هذي مواقع مستقلة، ما فيها دخول تلقائي بحساب المنصة — سجّل فيها مرة واحدة بنفس بريدك.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LESSONS.map(l => (
          <button key={l.id} onClick={() => setActive(l)}
            className="card overflow-hidden text-right hover:shadow-lg transition-all group">
            <div className="relative">
              <img src={l.image} alt={l.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
              <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[l.level]}`}>{l.level}</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{l.emoji}</span>
                <p className="font-bold text-gray-800">{l.title}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{l.intro}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
