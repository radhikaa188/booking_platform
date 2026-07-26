import random
import uuid

def process_payment(amount: float) -> dict:
    """
    Simulates a real payment gateway call.
    Randomly succeeds or fails, like a real gateway would under real-world conditions.
    """
    print("🔵 PAYMENT ACTUALLY PROCESSING NOW")
    transaction_id = str(uuid.uuid4())

    # Simulate 85% success rate (realistic — real payments do fail sometimes)
    success = random.random() < 0.85

    return {
        "transaction_id": transaction_id,
        "status": "success" if success else "failed",
        "amount": amount
    }

def process_refund(amount: float, original_transaction_id: str) -> dict:
    """
    Simulates a refund through the payment gateway.
    """
    refund_id = str(uuid.uuid4())
    return {
        "refund_id": refund_id,
        "original_transaction_id": original_transaction_id,
        "status": "refunded",
        "amount": amount
    }