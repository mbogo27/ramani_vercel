import bootloader


def print_result(label, result):
    print(f"\n--- {label} ---")
    print(result)


if __name__ == "__main__":
    bootloader.load_manifest(".")
    bootloader.load_index()
    bootloader.reset_session()

    print("Running STC smoke tests...")

    patient = bootloader.execute_stc(
        "STC-patient-db",
        "lookup_patient_by_phone",
        {"phone_number": "0712345678"}
    )
    print_result("Patient lookup", patient)

    appointments = bootloader.execute_stc(
        "STC-patient-db",
        "get_upcoming_appointments",
        {"patient_id": 1, "date_range": "next_7_days"}
    )
    print_result("Upcoming appointments", appointments)

    contact = bootloader.execute_stc(
        "STC-operations",
        "get_contact_details",
        {}
    )
    print_result("Contact details", contact)

    hours = bootloader.execute_stc(
        "STC-operations",
        "get_operating_hours",
        {"day": "all"}
    )
    print_result("Operating hours", hours)

    reviews = bootloader.execute_stc(
        "STC-gmaps-reviews",
        "get_recent_reviews",
        {"place_id": "ChIJ_arrow_dental_cbd", "max_results": 3, "min_rating": 4}
    )
    print_result("Google Maps reviews", reviews)

    whatsapp = bootloader.execute_stc(
        "STC-whatsapp",
        "send_booking_confirmation",
        {
            "recipient_phone": "+254712345678",
            "patient_name": "Amina Mwangi",
            "appointment_date": "2026-04-15",
            "branch_name": "CBD Branch"
        }
    )
    print_result("WhatsApp booking confirmation stub", whatsapp)

    recall = bootloader.execute_stc(
        "STC-whatsapp",
        "send_recall_reminder",
        {
            "recipient_phone": "+254712345678",
            "patient_name": "Amina Mwangi",
            "last_visit_date": "2026-04-03"
        }
    )
    print_result("WhatsApp recall reminder stub", recall)

    print("\nSTC smoke tests complete.")
