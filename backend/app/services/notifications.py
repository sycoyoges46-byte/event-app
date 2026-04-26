import logging

class NotificationService:
    @staticmethod
    async def send_registration_confirmation(email: str, event_name: str, status: str):
        # In a real system, this would send an email or SMS
        logging.info(f"NOTIFICATION: Sending {status} confirmation to {email} for event '{event_name}'")
        print(f"NOTIFICATION: {status} registration for '{event_name}' sent to {email}")

    @staticmethod
    async def send_event_update(emails: list[str], event_name: str, update_msg: str):
        logging.info(f"NOTIFICATION: Sending update to {len(emails)} students for event '{event_name}': {update_msg}")
        print(f"NOTIFICATION: Update for '{event_name}' sent to {len(emails)} students")

notification_service = NotificationService()
