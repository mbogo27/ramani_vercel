import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "arrow-dental.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.executescript("""
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS contact_details;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS operating_hours;
DROP TABLE IF EXISTS insurance;
DROP TABLE IF EXISTS gmaps_reviews;

CREATE TABLE patients (
    id INTEGER PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    last_visit_date TEXT,
    insurance_status TEXT,
    opted_out INTEGER DEFAULT 0
);

CREATE TABLE appointments (
    id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    branch TEXT NOT NULL,
    procedure_type TEXT NOT NULL,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
);

CREATE TABLE contact_details (
    id INTEGER PRIMARY KEY,
    whatsapp TEXT,
    phone TEXT,
    email TEXT
);

CREATE TABLE branches (
    id INTEGER PRIMARY KEY,
    branch_name TEXT NOT NULL,
    address TEXT NOT NULL,
    floor TEXT,
    maps_link TEXT
);

CREATE TABLE operating_hours (
    id INTEGER PRIMARY KEY,
    day TEXT NOT NULL,
    open_time TEXT NOT NULL,
    close_time TEXT NOT NULL
);

CREATE TABLE insurance (
    id INTEGER PRIMARY KEY,
    provider_name TEXT NOT NULL,
    accepted INTEGER NOT NULL
);

CREATE TABLE gmaps_reviews (
    review_id TEXT PRIMARY KEY,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review_text TEXT NOT NULL,
    review_date TEXT NOT NULL,
    reply_status TEXT NOT NULL
);
""")

cur.execute(
    "INSERT INTO patients (phone_number, patient_name, last_visit_date, insurance_status, opted_out) VALUES (?, ?, ?, ?, ?)",
    ("0712345678", "Amina Mwangi", "2026-04-03", "NHIF approved", 0)
)
cur.execute(
    "INSERT INTO patients (phone_number, patient_name, last_visit_date, insurance_status, opted_out) VALUES (?, ?, ?, ?, ?)",
    ("0722555123", "Peter Otieno", "2026-03-20", "Out-of-pocket", 0)
)

cur.executemany(
    "INSERT INTO appointments (patient_id, appointment_date, appointment_time, branch, procedure_type) VALUES (?, ?, ?, ?, ?)",
    [
        (1, "2026-04-15", "10:30", "CBD Branch", "Routine cleaning"),
        (1, "2026-04-25", "14:00", "Thika Branch", "Wisdom tooth consultation"),
        (2, "2026-04-17", "09:00", "CBD Branch", "Filling"),
    ]
)

cur.execute(
    "INSERT INTO contact_details (whatsapp, phone, email) VALUES (?, ?, ?)",
    ("+254712345678", "+254711000000", "hello@arrowdental.co.ke")
)

cur.executemany(
    "INSERT INTO branches (branch_name, address, floor, maps_link) VALUES (?, ?, ?, ?)",
    [
        ("CBD Branch", "Pension Towers, Kimathi St, Nairobi", "Ground Floor", "https://goo.gl/maps/arrow-cbd"),
        ("Thika Branch", "Thika Road Mall, Thika", "First Floor", "https://goo.gl/maps/arrow-thika"),
    ]
)

cur.executemany(
    "INSERT INTO operating_hours (day, open_time, close_time) VALUES (?, ?, ?)",
    [
        ("weekday", "08:00", "18:00"),
        ("saturday", "09:00", "14:00"),
        ("sunday", "10:00", "13:00"),
    ]
)

cur.executemany(
    "INSERT INTO insurance (provider_name, accepted) VALUES (?, ?)",
    [
        ("NHIF", 1),
        ("AAR", 1),
        ("Britam", 1),
        ("CIC", 0),
    ]
)

cur.executemany(
    "INSERT INTO gmaps_reviews (review_id, reviewer_name, rating, review_text, review_date, reply_status) VALUES (?, ?, ?, ?, ?, ?)",
    [
        ("gm1", "Jane Doe", 5, "Excellent service and friendly staff. I felt very comfortable during my visit.", "2026-04-08", "replied"),
        ("gm2", "John Mwangi", 2, "I waited too long and the receptionist was rude. The clinic was not very clean.", "2026-04-05", "unanswered"),
        ("gm3", "Sarah Kimani", 4, "Good work on my filling, but the wait time was longer than expected.", "2026-04-06", "replied"),
    ]
)

conn.commit()
conn.close()

print(f"Demo database created at {DB_PATH}")
