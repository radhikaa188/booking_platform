import os
import resend
from app.logger import logger

resend.api_key = os.getenv("RESEND_API_KEY")

def send_booking_confirmation(to_email: str, booking_id: int, amount: float):
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": f"Booking Confirmed - #{booking_id}",
            "html": f"""
                <h2>Your booking is confirmed!</h2>
                <p>Booking ID: #{booking_id}</p>
                <p>Amount paid: ₹{amount}</p>
                <p>Thank you for booking with us.</p>
            """
        })
        logger.info(f"Confirmation email sent for booking {booking_id}")
    except Exception as e:
        logger.warning(f"Failed to send confirmation email: {e}")


def send_cancellation_email(to_email: str, booking_id: int, refund_amount: float):
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": f"Booking Cancelled - #{booking_id}",
            "html": f"""
                <h2>Your booking has been cancelled</h2>
                <p>Booking ID: #{booking_id}</p>
                <p>Refund amount: ₹{refund_amount}</p>
                <p>Refund will be processed shortly.</p>
            """
        })
        logger.info(f"Cancellation email sent for booking {booking_id}")
    except Exception as e:
        logger.warning(f"Failed to send cancellation email: {e}")